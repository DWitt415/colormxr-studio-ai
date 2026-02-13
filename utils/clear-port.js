#!/usr/bin/env node

/**
 * Clear Port Script
 * 
 * This script checks if port 3000 is in use and terminates any processes using it.
 * Run this script before starting your development server to ensure clean port usage.
 */

const { exec } = require('child_process');

// Function to find and kill processes using port 3000
const clearPort = (port = 3000) => {
  console.log(`Checking for processes using port ${port}...`);
  
  const command = process.platform === 'win32'
    ? `netstat -ano | findstr :${port}`
    : `lsof -i :${port}`;

  exec(command, (error, stdout) => {
    if (error && !stdout) {
      console.log(`✅ Port ${port} is clear and ready to use.`);
      return;
    }

    // Process found using the port
    console.log(`Found process(es) using port ${port}:`);
    console.log(stdout);
    
    if (process.platform === 'win32') {
      // Windows: parse PID from netstat output and kill
      const pidMatch = stdout.match(/LISTENING\s+(\d+)/);
      if (pidMatch && pidMatch[1]) {
        const pid = pidMatch[1];
        exec(`taskkill /F /PID ${pid}`, (err) => {
          if (err) {
            console.error(`❌ Failed to terminate process ${pid}: ${err.message}`);
          } else {
            console.log(`✅ Successfully terminated process ${pid}`);
          }
        });
      }
    } else {
      // macOS/Linux: use kill command with PIDs from lsof
      const lines = stdout.trim().split('\n');
      if (lines.length > 0) {
        // Skip header line in lsof output if present
        const startLine = lines[0].includes('COMMAND') ? 1 : 0;
        
        for (let i = startLine; i < lines.length; i++) {
          const parts = lines[i].trim().split(/\s+/);
          const pid = parts[1];
          if (pid && /^\d+$/.test(pid)) {
            exec(`kill -9 ${pid}`, (err) => {
              if (err) {
                console.error(`❌ Failed to terminate process ${pid}: ${err.message}`);
              } else {
                console.log(`✅ Successfully terminated process ${pid}`);
              }
            });
          }
        }
      }
    }
  });
};

// Execute the function
clearPort();

console.log('\nTIP: You can run this script before starting your dev server:');
console.log('node utils/clear-port.js && npm run dev');
