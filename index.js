#!/usr/bin/env node
import { Command } from 'commander';
import { extractUsername } from './src/api.js';
import { createServer, shutdownServer } from './src/server.js';

const program = new Command();

program
  .name('repo-city')
  .description('Turn any GitHub profile into an explorable 3D city')
  .version('1.0.0')
  .argument('<url>', 'GitHub profile URL')
  .option('-p, --port <number>', 'Port number', '8765')
  .action(async (url, options) => {
    const username = extractUsername(url);
    
    if (!username) {
      console.error('❌ Invalid GitHub URL. Please use format: https://github.com/username');
      process.exit(1);
    }
    
    console.log(`🌍 Generating full city infrastructure for ${username}...`);
    
    const port = parseInt(options.port, 10);
    
    let server;
    try {
      server = await createServer(username, port);
      
      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        await shutdownServer(server);
        process.exit(0);
      });
      
      process.on('SIGTERM', async () => {
        await shutdownServer(server);
        process.exit(0);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error.message);
      process.exit(1);
    }
  });

program.parse();