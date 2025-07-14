#!/usr/bin/env node

/**
 * Clean Development Server Runner
 * Runs Next.js dev server without Netlify's verbose logging
 */

const { spawn } = require('child_process');
const path = require('path');

// Kill ports first
const killPorts = spawn('node', ['scripts/kill-ports.js'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

killPorts.on('close', (code) => {
  if (code !== 0) {
    console.error('Failed to kill ports');
    process.exit(1);
  }

  console.log('🚀 Starting Next.js development server...');
  console.log('📍 URL: http://localhost:3000\n');

  // Start Next.js directly
  const next = spawn('npx', ['next', 'dev'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      // Suppress Next.js telemetry
      NEXT_TELEMETRY_DISABLED: '1'
    }
  });

  next.on('error', (err) => {
    console.error('Failed to start Next.js:', err);
    process.exit(1);
  });

  next.on('close', (code) => {
    process.exit(code);
  });

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('\n⏹️  Stopping development server...');
    next.kill('SIGINT');
  });
});