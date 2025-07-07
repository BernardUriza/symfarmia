#!/usr/bin/env node

/**
 * Safe Build Script
 * Bypasses problematic Next.js optimizations that cause Bus errors
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Starting safe build process...');

try {
  // Step 1: Generate version
  console.log('📝 Generating version info...');
  execSync('node scripts/generate-version.js', { stdio: 'inherit' });

  // Step 2: Skip type-check for now due to memory issues
  console.log('⏭️ Skipping type-check to avoid memory issues...');

  // Step 3: Generate Prisma client
  console.log('🗄️ Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Step 4: Disable problematic optimizations
  console.log('🚫 Disabling problematic optimizations...');
  const nextConfig = fs.readFileSync('next.config.js', 'utf8');
  
  // Create temporary config for safe build
  const safeConfig = nextConfig.replace(
    'webpackBuildWorker: false,',
    'webpackBuildWorker: false,\n    turbopack: false,'
  );
  
  fs.writeFileSync('next.config.js.backup', nextConfig);
  fs.writeFileSync('next.config.js', safeConfig);

  // Step 5: Build with reduced optimizations
  console.log('🏗️ Building with safe settings...');
  execSync('NODE_OPTIONS="--max-old-space-size=4096" WEBPACK_MINIMIZE=false npx next build --no-lint', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_ENV: 'production',
      WEBPACK_MINIMIZE: 'false'
    }
  });

  // Restore original config
  fs.renameSync('next.config.js.backup', 'next.config.js');
  
  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  
  // Restore config if backup exists
  if (fs.existsSync('next.config.js.backup')) {
    fs.renameSync('next.config.js.backup', 'next.config.js');
  }
  
  process.exit(1);
}