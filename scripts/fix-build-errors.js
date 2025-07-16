#!/usr/bin/env node

/**
 * Fix common Next.js build errors
 * 
 * This script helps resolve common build issues like:
 * - Missing .nft.json files
 * - Corrupted build cache
 * - Permission issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing Next.js build errors...\n');

// 1. Clean build directories
console.log('1. Cleaning build directories...');
const buildDirs = ['.next', 'out'];
buildDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    console.log(`   Removing ${dir}/`);
    execSync(`rm -rf ${dirPath}`, { stdio: 'inherit' });
  }
});

// 2. Clear Next.js cache
console.log('\n2. Clearing Next.js cache...');
const cacheDir = path.join(process.cwd(), 'node_modules/.cache');
if (fs.existsSync(cacheDir)) {
  console.log('   Removing node_modules/.cache');
  execSync(`rm -rf ${cacheDir}`, { stdio: 'inherit' });
}

// 3. Ensure API route directories exist
console.log('\n3. Checking API routes...');
const apiDir = path.join(process.cwd(), 'app/api');
if (fs.existsSync(apiDir)) {
  const routes = fs.readdirSync(apiDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(`   Found ${routes.length} API routes`);
  routes.forEach(route => {
    console.log(`   ✓ ${route}`);
  });
}

// 4. Verify TypeScript configuration
console.log('\n4. Verifying TypeScript configuration...');
const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  console.log('   ✓ tsconfig.json found');
} else {
  console.log('   ⚠️  tsconfig.json not found');
}

// 5. Create .next directory structure
console.log('\n5. Creating build directory structure...');
const nextDir = path.join(process.cwd(), '.next');
fs.mkdirSync(nextDir, { recursive: true });
console.log('   ✓ .next directory created');

console.log('\n✅ Build error fixes applied!');
console.log('\nNext steps:');
console.log('1. Run: npm run build');
console.log('2. If errors persist, try: npm ci');
console.log('3. For stubborn issues: rm -rf node_modules && npm install\n');