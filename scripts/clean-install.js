#!/usr/bin/env node

/**
 * Clean Install Script
 * Removes all node_modules and package-lock, then installs fresh
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Starting clean installation process...\n');

// Step 1: Kill any running Node processes
console.log('1️⃣ Stopping any running processes...');
try {
  execSync('pkill -f "node.*next" || true', { stdio: 'inherit' });
  execSync('pkill -f "node.*netlify" || true', { stdio: 'inherit' });
  console.log('   ✅ Processes stopped\n');
} catch (e) {
  console.log('   ℹ️  No processes to stop\n');
}

// Step 2: Remove node_modules and lock files
console.log('2️⃣ Removing old dependencies...');
const toRemove = [
  'node_modules',
  'package-lock.json',
  '.next',
  '.netlify'
];

toRemove.forEach(item => {
  const itemPath = path.join(process.cwd(), item);
  if (fs.existsSync(itemPath)) {
    console.log(`   🗑️  Removing ${item}...`);
    execSync(`rm -rf "${itemPath}"`, { stdio: 'ignore' });
  }
});
console.log('   ✅ Clean slate achieved\n');

// Step 3: Clear npm cache
console.log('3️⃣ Clearing npm cache...');
execSync('npm cache clean --force', { stdio: 'ignore' });
console.log('   ✅ Cache cleared\n');

// Step 4: Install dependencies
console.log('4️⃣ Installing fresh dependencies...');
console.log('   This may take a few minutes...\n');

const install = spawn('npm', ['install', '--legacy-peer-deps', '--no-audit', '--no-fund'], {
  stdio: ['inherit', 'pipe', 'pipe']
});

let lastMessage = '';
const startTime = Date.now();

install.stdout.on('data', (data) => {
  const message = data.toString();
  // Show progress updates
  if (message.includes('added') || message.includes('packages') || message.includes('resolved')) {
    process.stdout.write('\r' + ' '.repeat(80) + '\r'); // Clear line
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    process.stdout.write(`   ⏱️  ${elapsed}s - ${message.trim().substring(0, 60)}...`);
    lastMessage = message;
  }
});

install.stderr.on('data', (data) => {
  const error = data.toString();
  // Only show non-warning errors
  if (!error.includes('deprecated') && !error.includes('warn') && !error.includes('npm notice')) {
    console.error('\n❌ Error:', error.trim());
  }
});

install.on('close', (code) => {
  process.stdout.write('\r' + ' '.repeat(80) + '\r'); // Clear line
  
  if (code === 0) {
    console.log('   ✅ Dependencies installed successfully!\n');
    
    // Check if Next.js is installed
    const nextPath = path.join('node_modules', '.bin', 'next');
    if (fs.existsSync(nextPath)) {
      console.log('✅ Next.js is installed and ready!');
    } else {
      console.log('⚠️  Next.js binary not found, but should work with npx');
    }
    
    console.log('\n🚀 You can now run:');
    console.log('   npm run dev        - Start development server');
    console.log('   npm run dev:quiet  - Start with filtered logs');
    console.log('   npm run build      - Build for production\n');
  } else {
    console.error(`\n❌ Installation failed with code ${code}`);
    console.error('\n💡 Try these alternatives:');
    console.error('   1. npm run dev (uses npx, no install needed)');
    console.error('   2. yarn install (if you have yarn)');
    console.error('   3. pnpm install (if you have pnpm)\n');
  }
  
  process.exit(code);
});

install.on('error', (err) => {
  console.error('\n❌ Failed to start npm install:', err);
  process.exit(1);
});