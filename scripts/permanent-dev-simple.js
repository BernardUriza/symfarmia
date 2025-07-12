#!/usr/bin/env node

/**
 * Simple Permanent Dev Server
 * A minimalist, reliable dev server for port 3002
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 3002;
const PID_FILE = '/tmp/symfarmia-permanent.pid';
const LOG_FILE = '/tmp/symfarmia-permanent.log';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function killProcessOnPort(port) {
  try {
    // Try to find and kill process on port
    const pid = execSync(`lsof -ti:${port} || true`, { encoding: 'utf8' }).trim();
    if (pid) {
      execSync(`kill -9 ${pid}`);
      log(`✓ Killed process ${pid} on port ${port}`, 'yellow');
    }
  } catch (e) {
    // Ignore errors - port might be free
  }
}

function start() {
  log(`🚀 Starting permanent dev server on port ${PORT}...`, 'blue');
  
  // Clean up any existing process
  stop();
  killProcessOnPort(PORT);
  
  // Ensure log file exists
  fs.writeFileSync(LOG_FILE, `Starting server at ${new Date().toISOString()}\n`);
  
  // Prepare the command to run with nohup
  const cmd = `NODE_OPTIONS='--max-old-space-size=4096 --no-warnings' PORT=${PORT} npx next dev --port ${PORT} >> ${LOG_FILE} 2>&1 & echo $!`;
  
  try {
    // Execute the command and get the PID
    const pid = execSync(cmd, {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
      shell: '/bin/bash'
    }).trim();
    
    // Write PID
    fs.writeFileSync(PID_FILE, pid);
    
    log(`✅ Server started with PID: ${pid}`, 'green');
    log(`📝 Logs: ${LOG_FILE}`, 'blue');
    log(`🌐 URL: http://localhost:${PORT}`, 'green');
    
    return;
  } catch (error) {
    log(`❌ Failed to start server: ${error.message}`, 'red');
    process.exit(1);
  }
  
  // Give instructions
  setTimeout(() => {
    log('\nℹ️  Server may take 10-20 seconds to be fully ready', 'yellow');
    log('ℹ️  Use "npm run permanent:status" to check status', 'yellow');
  }, 1000);
}

function stop() {
  try {
    if (fs.existsSync(PID_FILE)) {
      const pid = fs.readFileSync(PID_FILE, 'utf8').trim();
      try {
        process.kill(parseInt(pid, 10), 'SIGTERM');
        log(`✓ Stopped server with PID ${pid}`, 'green');
      } catch (e) {
        // Process might already be dead
      }
      fs.unlinkSync(PID_FILE);
    }
  } catch (e) {
    // Ignore errors
  }
}

function status() {
  try {
    // First check if PID file exists and process is running
    let processRunning = false;
    let pid = null;
    
    if (fs.existsSync(PID_FILE)) {
      pid = fs.readFileSync(PID_FILE, 'utf8').trim();
      try {
        // Check if process is still alive
        process.kill(parseInt(pid, 10), 0);
        processRunning = true;
      } catch (e) {
        // Process is dead
        fs.unlinkSync(PID_FILE);
      }
    }
    
    // Check if server is responding
    try {
      const response = execSync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT} || echo "000"`, { encoding: 'utf8' }).trim();
      if (response === '200') {
        log(`✅ Server is running and responding on port ${PORT}`, 'green');
        log(`🌐 http://localhost:${PORT}`, 'blue');
        if (pid) {
          log(`📊 PID: ${pid}`, 'blue');
        }
      } else if (processRunning) {
        log(`⚠️  Server process is running but not yet responding`, 'yellow');
        log(`📊 PID: ${pid}`, 'blue');
        log(`ℹ️  Server may still be starting up...`, 'yellow');
      } else {
        log(`❌ Server is not running`, 'red');
      }
    } catch (e) {
      if (processRunning) {
        log(`⚠️  Server process is running but not responding`, 'yellow');
        log(`📊 PID: ${pid}`, 'blue');
      } else {
        log(`❌ Server is not running`, 'red');
      }
    }
  } catch (e) {
    log(`❌ Error checking status: ${e.message}`, 'red');
  }
}

function logs() {
  if (fs.existsSync(LOG_FILE)) {
    log(`📝 Showing logs from ${LOG_FILE}`, 'blue');
    log('Press Ctrl+C to exit\n', 'yellow');
    
    // Use tail -f to follow logs
    const tail = spawn('tail', ['-f', LOG_FILE], {
      stdio: 'inherit'
    });
    
    process.on('SIGINT', () => {
      tail.kill();
      process.exit(0);
    });
  } else {
    log(`❌ No log file found at ${LOG_FILE}`, 'red');
  }
}

// Main command handling
const command = process.argv[2];

switch (command) {
  case 'start':
    start();
    break;
  case 'stop':
    stop();
    log('✅ Server stopped', 'green');
    break;
  case 'restart':
    stop();
    setTimeout(start, 1000);
    break;
  case 'status':
    status();
    break;
  case 'logs':
    logs();
    break;
  default:
    log('Simple Permanent Dev Server', 'blue');
    log('Usage: node permanent-dev-simple.js [command]', 'yellow');
    log('\nCommands:');
    log('  start   - Start the server');
    log('  stop    - Stop the server');
    log('  restart - Restart the server');
    log('  status  - Check server status');
    log('  logs    - Show server logs');
    process.exit(1);
}