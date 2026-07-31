// HTTP Server Module with Automatic Port Switcher & Graceful Shutdown
import http from 'http';
import { URL } from 'url';
import { exec } from 'child_process';
import { getHomeHTML, getCityHTML } from './renderer.js';

const DEFAULT_PORT = 8765;

/**
 * Create and start the HTTP server with automatic port retry if port in use
 * @param {string} username - GitHub username
 * @param {number} startPort - Preferred port number
 * @returns {Promise<http.Server>} Server instance
 */
export function createServer(username, startPort = DEFAULT_PORT) {
  let currentPort = startPort;

  const tryListen = (port) => {
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
        console.log(`🚀 Launching Smart 3D City Environment...`);
        console.log(`🌐 Server running at http://localhost:${port}`);
        
        // Open browser automatically on the selected active port
        setTimeout(() => {
          exec(`start http://localhost:${port}`);
        }, 500);
        
        resolve(server);
      });

      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.warn(`⚠️ Port ${port} is in use, automatically switching to port ${port + 1}...`);
          resolve(tryListen(port + 1));
        } else {
          console.error(`❌ Server error: ${error.message}`);
          reject(error);
        }
      });
    });
  };

  return tryListen(currentPort);
}

/**
 * Gracefully shutdown the server
 * @param {http.Server} server - Server instance
 */
export function shutdownServer(server) {
  return new Promise((resolve) => {
    console.log('\n👋 Shutting down server...');
    if (server && server.close) {
      server.close(() => {
        console.log('✅ Server stopped');
        resolve();
      });
    } else {
      resolve();
    }
  });
}
