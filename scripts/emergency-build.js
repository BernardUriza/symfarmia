#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');

console.log('🚨 EMERGENCY BUILD SYSTEM');
console.log('==========================\n');

// Clean everything first
console.log('1. Cleaning all caches and build artifacts...');
if (fs.existsSync('.next')) {
  fs.rmSync('.next', { recursive: true, force: true });
  console.log('✅ Removed .next directory');
}

if (fs.existsSync('node_modules/.cache')) {
  fs.rmSync('node_modules/.cache', { recursive: true, force: true });
  console.log('✅ Removed node_modules/.cache');
}

console.log('\n2. Generating Prisma client...');
const prismaProcess = spawn('npx', ['prisma', 'generate'], { stdio: 'inherit' });

prismaProcess.on('close', (code) => {
  if (code !== 0) {
    console.log('❌ Prisma generation failed');
    process.exit(1);
  }
  
  console.log('\n3. Starting build with AGGRESSIVE memory optimizations...');
  
  // Ultra-conservative build settings
  const buildProcess = spawn('npx', ['next', 'build'], {
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=1024 --max-semi-space-size=64',
      NEXT_TELEMETRY_DISABLED: '1',
      NODE_ENV: 'production',
      // Force minimal webpack configuration
      WEBPACK_MINIMIZE: 'false',
      WEBPACK_OPTIMIZE: 'false'
    },
    stdio: 'inherit'
  });
  
  // Kill if hangs for more than 3 minutes
  const hangTimeout = setTimeout(() => {
    console.log('\n❌ BUILD HANGING - Killing process after 3 minutes');
    buildProcess.kill('SIGKILL');
    console.log('\n🔧 ALTERNATIVE SOLUTION NEEDED:');
    console.log('1. Try: npm run build:fast');
    console.log('2. Or disable optimization in next.config.js');
    console.log('3. Or use: WEBPACK_MINIMIZE=false npm run build');
    process.exit(1);
  }, 180000); // 3 minutes
  
  // Progress indicator
  let dots = 0;
  const progressInterval = setInterval(() => {
    process.stdout.write('.');
    dots++;
    if (dots % 60 === 0) {
      process.stdout.write(` ${Math.floor(dots/60)}min\n`);
    }
  }, 1000);
  
  buildProcess.on('close', (code) => {
    clearTimeout(hangTimeout);
    clearInterval(progressInterval);
    console.log(`\n\nBuild finished with code: ${code}`);
    
    if (code === 0) {
      console.log('✅ BUILD SUCCESSFUL!');
    } else {
      console.log('❌ BUILD FAILED');
    }
  });
});