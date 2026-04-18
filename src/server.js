// HTTP Server Module
import http from 'http';
import { URL } from 'url';
import { exec } from 'child_process';
import { getHomeHTML } from './renderer.js';
import { getCityHTML } from './renderer.js';

// Configuration
const DEFAULT_PORT = 8765;

/**
 * Create and start the HTTP server
 * @param {string} username - GitHub username
 * @param {number} port - Port number
 * @returns {Promise<http.Server>} Server instance
 */
export function createServer(username, port = DEFAULT_PORT) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
      
      try {
        if (parsedUrl.pathname === '/') {
          res.writeHead(200, { 
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache'
          });
          const html = await getHomeHTML(username);
          res.end(html);
        } else if (parsedUrl.pathname === '/view') {
          const repoName = parsedUrl.searchParams.get('repo');
          if (!repoName) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('No repository specified');
            return;
          }
          res.writeHead(200, { 
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache'
          });
          const html = await getCityHTML(username, repoName);
          res.end(html);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
      } catch (error) {
        console.error(`❌ Server error: ${error.message}`);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Internal Server Error: ${error.message}`);
      }
    });

    server.listen(port, () => {
      console.log(`🚀 Launching Smart Environment...`);
      console.log(`🌐 Server running at http://localhost:${port}`);
      
      // Open browser after a short delay
      setTimeout(() => {
        exec(`start http://localhost:${port}`);
      }, 500);
      
      resolve(server);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`);
        console.error('💡 Try running with a different port: node index.js <url> --port 8766');
      } else {
        console.error(`❌ Server error: ${error.message}`);
      }
      reject(error);
    });
  });
}

/**
 * Gracefully shutdown the server
 * @param {http.Server} server - Server instance
 */
export function shutdownServer(server) {
  return new Promise((resolve) => {
    console.log('\n👋 Shutting down server...');
    server.close(() => {
      console.log('✅ Server stopped');
      resolve();
    });
  });
}
