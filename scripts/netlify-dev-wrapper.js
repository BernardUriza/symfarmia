#!/usr/bin/env node

/**
 * Netlify Dev Wrapper
 * Ensures Next.js stays running for Netlify
 */

const { spawn } = require('child_process');
const { existsSync } = require('fs');

// First kill ports
const killPorts = spawn('node', ['scripts/kill-ports.js'], {
  stdio: 'inherit'
});

killPorts.on('close', (code) => {
  if (code !== 0) {
    process.exit(1);
  }

  // Check if Next.js is available
  const hasNext = existsSync('node_modules/.bin/next');
  
  if (!hasNext) {
    console.log('📦 Installing Next.js...');
    const install = spawn('npm', ['install', 'next', 'react', 'react-dom', '--no-save'], {
      stdio: 'inherit'
    });
    
    install.on('close', (installCode) => {
      if (installCode !== 0) {
        console.error('Failed to install Next.js');
        process.exit(1);
      }
      startNext();
    });
  } else {
    startNext();
  }
});

function startNext() {
  const next = spawn('npx', ['next', 'dev'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1'
    }
  });

  // Keep the process alive
  next.on('error', (err) => {
    console.error('Next.js error:', err);
    process.exit(1);
  });

  next.on('close', (code) => {
    // Don't exit on code 0, keep running
    if (code !== 0) {
      process.exit(code);
    }
  });

  // Forward signals
  process.on('SIGINT', () => {
    next.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    next.kill('SIGTERM');
    process.exit(0);
  });
}