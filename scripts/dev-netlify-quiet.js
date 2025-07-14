#!/usr/bin/env node

/**
 * Quiet Netlify Dev Runner
 * Runs netlify dev with heavily filtered output
 */

const { spawn } = require('child_process');
const readline = require('readline');

console.log('🚀 Starting Netlify Dev (quiet mode)...\n');

const netlify = spawn('npx', ['netlify', 'dev'], {
  env: {
    ...process.env,
    // Reduce Netlify verbosity
    DEBUG: '',
    NETLIFY_DEV_DEBUG: 'false',
    SUPPRESS_SUPPORT: 'true'
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

// Filter patterns to ignore - MORE AGGRESSIVE
const ignorePatterns = [
  /^⬥ Ignored/,
  /^⬥ Injecting environment/,
  /^⬥ Injected/,
  /env var:/,
  /defined in/,
  /^⬥ Setting up local dev server$/,
  /^⬥ Starting #custom dev server$/,
  /Cleaning up ports/,
  /No process found on port/,
  /All ports were already free/,
  /⠋ Waiting for #custom dev server/,
  /⠙ Waiting for #custom dev server/,
  /⠹ Waiting for #custom dev server/,
  /⠸ Waiting for #custom dev server/,
  /⠼ Waiting for #custom dev server/,
  /⠴ Waiting for #custom dev server/,
  /⠦ Waiting for #custom dev server/,
  /⠧ Waiting for #custom dev server/,
  /⠇ Waiting for #custom dev server/,
  /⠏ Waiting for #custom dev server/
];

// Important patterns to always show
const importantPatterns = [
  /Error:/i,
  /Failed/i,
  /not found/i,
  /Cannot find/i,
  /◈ Server now ready/,
  /http:\/\/localhost/,
  /Ready in/,
  /compiled/,
  /warning/i
];

// State tracking
let serverReady = false;
let hasShownStartMessage = false;

// Process stdout
rlOut.on('line', (line) => {
  // Check if it's important first
  const isImportant = importantPatterns.some(pattern => pattern.test(line));
  
  // If important, always show
  if (isImportant) {
    console.log(line);
    if (line.includes('Server now ready') || line.includes('http://localhost')) {
      serverReady = true;
    }
    return;
  }
  
  // Otherwise, check if we should ignore
  const shouldIgnore = ignorePatterns.some(pattern => pattern.test(line));
  
  if (!shouldIgnore && line.trim()) {
    // Show custom dev server output after initial setup
    if (line.includes('> symfarmia-app@') || serverReady) {
      if (!hasShownStartMessage && line.includes('dev:next')) {
        console.log('\n📦 Starting Next.js server...');
        hasShownStartMessage = true;
      } else if (!line.includes('> node scripts/kill-ports.js')) {
        console.log(line);
      }
    }
  }
});

// Process stderr with same logic
rlErr.on('line', (line) => {
  const isImportant = importantPatterns.some(pattern => pattern.test(line));
  if (isImportant) {
    console.error(line);
    return;
  }
  
  const shouldIgnore = ignorePatterns.some(pattern => pattern.test(line));
  if (!shouldIgnore && line.trim()) {
    console.error(line);
  }
});

netlify.on('error', (err) => {
  console.error('❌ Failed to start Netlify Dev:', err);
  process.exit(1);
});

netlify.on('close', (code) => {
  if (code !== 0) {
    console.error(`\n❌ Netlify Dev exited with code ${code}`);
    console.error('\n💡 Debug tips:');
    console.error('   1. Run "npm run dev:debug" to see all output');
    console.error('   2. Run "npm run dev" to bypass Netlify');
    console.error('   3. Check if dependencies are installed: "npm install"');
  }
  process.exit(code);
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n⏹️  Stopping Netlify Dev...');
  netlify.kill('SIGINT');
});