#!/usr/bin/env node

/**
 * Quiet Netlify Dev Runner
 * Runs netlify dev with filtered output
 */

const { spawn } = require('child_process');
const readline = require('readline');

console.log('🚀 Starting Netlify Dev (quiet mode)...\n');

const netlify = spawn('npx', ['netlify', 'dev'], {
  env: {
    ...process.env,
    // Reduce Netlify verbosity
    DEBUG: '',
    NETLIFY_DEV_DEBUG: 'false'
  }
});

// Create readline interface for stdout
const rlOut = readline.createInterface({
  input: netlify.stdout,
  crlfDelay: Infinity
});

// Create readline interface for stderr
const rlErr = readline.createInterface({
  input: netlify.stderr,
  crlfDelay: Infinity
});

// Filter patterns to ignore
const ignorePatterns = [
  /^⬥ Ignored/,
  /^⬥ Injecting environment/,
  /^⬥ Injected/,
  /env var:/,
  /defined in/
];

// Process stdout
rlOut.on('line', (line) => {
  const shouldIgnore = ignorePatterns.some(pattern => pattern.test(line));
  if (!shouldIgnore && line.trim()) {
    console.log(line);
  }
});

// Process stderr
rlErr.on('line', (line) => {
  const shouldIgnore = ignorePatterns.some(pattern => pattern.test(line));
  if (!shouldIgnore && line.trim()) {
    console.error(line);
  }
});

netlify.on('error', (err) => {
  console.error('Failed to start Netlify Dev:', err);
  process.exit(1);
});

netlify.on('close', (code) => {
  process.exit(code);
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n⏹️  Stopping Netlify Dev...');
  netlify.kill('SIGINT');
});