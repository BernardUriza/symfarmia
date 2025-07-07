#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');

console.log('🔍 DEBUGGING BUILD HANG ISSUE');
console.log('===============================\n');

// Check current processes
console.log('1. Checking for hanging processes...');
const ps = spawn('ps', ['aux']);
ps.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  const nextProcesses = lines.filter(line => line.includes('next') || line.includes('webpack'));
  if (nextProcesses.length > 0) {
    console.log('Found processes:', nextProcesses);
  }
});

// Check memory usage
console.log('2. Checking system memory...');
const free = spawn('free', ['-h']);
free.stdout.on('data', (data) => {
  console.log('Memory status:');
  console.log(data.toString());
});

// Check disk space
console.log('3. Checking disk space...');
const df = spawn('df', ['-h', '.']);
df.stdout.on('data', (data) => {
  console.log('Disk space:');
  console.log(data.toString());
});

// Try a minimal Next.js build with timeout
console.log('4. Testing minimal Next.js build with timeout...');

const timeout = setTimeout(() => {
  console.log('❌ BUILD TIMED OUT after 30 seconds');
  console.log('This confirms the hanging issue.');
  process.exit(1);
}, 30000);

const buildProcess = spawn('npx', ['next', 'build'], {
  env: {
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=2048',
    NEXT_TELEMETRY_DISABLED: '1'
  }
});

let outputReceived = false;

buildProcess.stdout.on('data', (data) => {
  outputReceived = true;
  console.log('BUILD OUTPUT:', data.toString());
});

buildProcess.stderr.on('data', (data) => {
  outputReceived = true;
  console.log('BUILD ERROR:', data.toString());
});

buildProcess.on('close', (code) => {
  clearTimeout(timeout);
  console.log(`Build process exited with code: ${code}`);
  if (!outputReceived) {
    console.log('❌ NO OUTPUT RECEIVED - This indicates a hanging issue');
  }
});

// Monitor for 5 seconds of no output
let lastOutput = Date.now();
const monitor = setInterval(() => {
  if (outputReceived) {
    lastOutput = Date.now();
    outputReceived = false;
  } else if (Date.now() - lastOutput > 10000) {
    console.log('❌ NO OUTPUT for 10 seconds - Build appears to be hanging');
    console.log('Killing process...');
    buildProcess.kill('SIGKILL');
    clearInterval(monitor);
    clearTimeout(timeout);
  }
}, 1000);