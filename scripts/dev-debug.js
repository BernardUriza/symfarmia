#!/usr/bin/env node

/**
 * Debug Development Server Runner
 * Shows detailed output for troubleshooting
 */

const { spawn } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

console.log('🔍 Debug Mode - Checking environment...\n');

// Check if node_modules exists
if (!existsSync('node_modules')) {
  console.error('❌ node_modules directory not found!');
  console.error('   Run: npm install --legacy-peer-deps\n');
  process.exit(1);
}

// Check if Next.js is installed
const nextPath = path.join('node_modules', '.bin', 'next');
const hasNext = existsSync(nextPath);

console.log(`📦 Next.js installed: ${hasNext ? '✅ Yes' : '❌ No'}`);
console.log(`📍 Working directory: ${process.cwd()}`);
console.log(`🔧 Node version: ${process.version}\n`);

// Kill ports first
console.log('🧹 Cleaning ports...');
const killPorts = spawn('node', ['scripts/kill-ports.js'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

killPorts.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Failed to kill ports');
    process.exit(1);
  }

  console.log('\n🚀 Starting Next.js with detailed output...\n');

  // Try different methods to start Next.js
  const command = hasNext ? 'node' : 'npx';
  const args = hasNext 
    ? [nextPath, 'dev'] 
    : ['--yes', 'next@latest', 'dev'];

  console.log(`📝 Command: ${command} ${args.join(' ')}\n`);

  const next = spawn(command, args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
      NODE_ENV: 'development'
    },
    cwd: process.cwd()
  });

  next.on('error', (err) => {
    console.error('\n❌ Failed to start Next.js:');
    console.error('   Error:', err.message);
    console.error('   Code:', err.code);
    console.error('\n💡 Try running:');
    console.error('   1. npm install --legacy-peer-deps');
    console.error('   2. npx next dev');
    process.exit(1);
  });

  next.on('close', (code) => {
    console.log(`\n📊 Next.js exited with code: ${code}`);
    if (code !== 0) {
      console.error('\n💡 Common fixes:');
      console.error('   1. Check for syntax errors in your code');
      console.error('   2. Delete .next directory: rm -rf .next');
      console.error('   3. Clear npm cache: npm cache clean --force');
    }
    process.exit(code);
  });

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('\n⏹️  Stopping development server...');
    next.kill('SIGINT');
  });
});