#!/usr/bin/env node

/**
 * Simple dependency installer
 * Installs dependencies without verbose output
 */

const { spawn } = require('child_process');

console.log('📦 Installing dependencies...\n');

const npm = spawn('npm', ['install', '--legacy-peer-deps', '--no-audit', '--no-fund', '--loglevel=error'], {
  stdio: ['ignore', 'pipe', 'pipe']
});

let dots = '';
const interval = setInterval(() => {
  process.stdout.write(`\r📦 Installing${dots}   `);
  dots = dots.length >= 3 ? '' : dots + '.';
}, 500);

npm.stdout.on('data', (data) => {
  // Only show important messages
  const message = data.toString();
  if (message.includes('added') || message.includes('packages')) {
    clearInterval(interval);
    console.log('\n' + message.trim());
  }
});

npm.stderr.on('data', (data) => {
  const error = data.toString();
  // Only show actual errors, not warnings
  if (!error.includes('deprecated') && !error.includes('warn')) {
    console.error(error);
  }
});

npm.on('close', (code) => {
  clearInterval(interval);
  if (code === 0) {
    console.log('\n✅ Dependencies installed successfully!\n');
    console.log('You can now run:');
    console.log('  npm run dev        - Clean Next.js dev server');
    console.log('  npm run dev:quiet  - Quiet Netlify dev server');
  } else {
    console.error('\n❌ Installation failed with code:', code);
    console.error('\nTry running: npm install --legacy-peer-deps');
  }
  process.exit(code);
});

npm.on('error', (err) => {
  clearInterval(interval);
  console.error('❌ Failed to start npm:', err);
  process.exit(1);
});