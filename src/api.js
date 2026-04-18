// GitHub API Interaction Module
import { exec } from 'child_process';

// Constants
const GITHUB_API_BASE = 'https://api.github.com';
const DEFAULT_PER_PAGE = 30;
const DEFAULT_COMMITS_LIMIT = 100;

// Rate limiting state
let rateLimitRemaining = 60;
let rateLimitReset = null;

/**
 * Get GitHub token from environment
 * @returns {string|null} GitHub token or null
 */
function getGitHubToken() {
  return process.env.GITHUB_TOKEN || null;
}

/**
 * Build headers with optional authentication
 * @returns {Object} Request headers
 */
function getHeaders() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'repo-city-cli'
  };
  
  const token = getGitHubToken();
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }
  
  return headers;
}

/**
 * Check and handle rate limiting
 * @param {Response} response - Fetch response object
 * @returns {boolean} True if rate limited
 */
function checkRateLimit(response) {
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');
  
  if (remaining) {
    rateLimitRemaining = parseInt(remaining, 10);
  }
  
  if (reset) {
    rateLimitReset = new Date(parseInt(reset, 10) * 1000);
  }
  
  if (rateLimitRemaining === 0) {
    const now = new Date();
    const waitTime = Math.ceil((rateLimitReset - now) / 60000);
    console.warn(`⚠️  GitHub API rate limit exceeded. Reset in ${waitTime} minute(s).`);
    console.warn('💡 Tip: Set GITHUB_TOKEN environment variable for higher limits (5000 req/hour)');
    return true;
  }
  
  return false;
}

/**
 * Fetch with error handling and rate limit checking
 * @param {string} url - URL to fetch
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} On fetch failure
 */
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { headers: getHeaders() });
      
      if (!response.ok) {
        if (response.status === 403) {
          checkRateLimit(response);
          throw new Error('Rate limit exceeded');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      checkRateLimit(response);
      return data;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`⚠️  Request failed, retrying... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

/**
 * Extract GitHub username from URL
 * @param {string} url - GitHub profile URL
 * @returns {string|null} Username or null if invalid
 */
export function extractUsername(url) {
  const match = url.match(/github\.com\/([^\/]+)/);
  return match ? match[1] : null;
}

/**
 * Fetch user repositories
 * @param {string} username - GitHub username
 * @returns {Promise<Array>} Array of repositories
 */
export async function fetchUserRepos(username) {
  try {
    console.log(`📡 Fetching repositories for ${username}...`);
    const url = `${GITHUB_API_BASE}/users/${username}/repos?per_page=${DEFAULT_PER_PAGE}&sort=size`;
    const repos = await fetchWithRetry(url);
    
    if (!Array.isArray(repos)) {
      throw new Error('Invalid response from GitHub API');
    }
    
    console.log(`✅ Found ${repos.length} repositories`);
    return repos;
  } catch (error) {
    console.error(`❌ Error fetching repositories: ${error.message}`);
    throw error;
  }
}

/**
 * Fetch repository file tree
 * @param {string} username - GitHub username
 * @param {string} repoName - Repository name
 * @param {string} branch - Branch name (main or master)
 * @returns {Promise<Object>} Repository tree data
 */
export async function fetchRepoTree(username, repoName, branch) {
  const url = `${GITHUB_API_BASE}/repos/${username}/${repoName}/git/trees/${branch}?recursive=1`;
  const data = await fetchWithRetry(url);
  return data;
}

/**
 * Fetch repository commits
 * @param {string} username - GitHub username
 * @param {string} repoName - Repository name
 * @returns {Promise<Array>} Array of commits
 */
export async function fetchRepoCommits(username, repoName) {
  const url = `${GITHUB_API_BASE}/repos/${username}/${repoName}/commits?per_page=${DEFAULT_COMMITS_LIMIT}`;
  return await fetchWithRetry(url);
}

/**
 * Fetch repository info
 * @param {string} username - GitHub username
 * @param {string} repoName - Repository name
 * @returns {Promise<Object>} Repository information
 */
export async function fetchRepoInfo(username, repoName) {
  const url = `${GITHUB_API_BASE}/repos/${username}/${repoName}`;
  return await fetchWithRetry(url);
}

/**
 * Get detailed repository information
 * @param {string} username - GitHub username
 * @param {string} repoName - Repository name
 * @returns {Promise<Object>} Repository details with files, heatmap, etc.
 */
export async function fetchRepoDetails(username, repoName) {
  try {
    console.log(`   📦 Loading ${repoName}...`);
    
    // Try main branch first, then master
    let data = await fetchRepoTree(username, repoName, 'main');
    if (!data.tree) {
      data = await fetchRepoTree(username, repoName, 'master');
    }
    
    // Filter to only files (blobs) with content
    const files = data.tree 
      ? data.tree.filter(item => item.type === 'blob' && item.size > 0)
      : [];
    
    // Fetch commits for heatmap
    const commits = await fetchRepoCommits(username, repoName);
    
    // Build commit heatmap
    const commitHeatmap = {};
    let maxCommits = 1;
    
    if (Array.isArray(commits)) {
      commits.forEach(commit => {
        if (commit.files) {
          commit.files.forEach(file => {
            commitHeatmap[file.filename] = (commitHeatmap[file.filename] || 0) + 1;
            if (commitHeatmap[file.filename] > maxCommits) {
              maxCommits = commitHeatmap[file.filename];
            }
          });
        }
      });
    }
    
    // Fetch repo info for metadata
    const info = await fetchRepoInfo(username, repoName);
    const lastUpdated = new Date(info.pushed_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return {
      files,
      commitHeatmap,
      maxCommits,
      lastUpdated,
      rawTimestamp: info.pushed_at
    };
  } catch (error) {
    console.error(`   ❌ Error loading ${repoName}: ${error.message}`);
    return {
      files: [],
      commitHeatmap: {},
      maxCommits: 1,
      lastUpdated: 'Unknown',
      rawTimestamp: null
    };
  }
}
