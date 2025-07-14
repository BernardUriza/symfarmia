const { spawn } = require('child_process');

console.log('Starting Next.js dev server...\n');

const proc = spawn('npm', ['run', 'dev'], {
  cwd: process.cwd(),
  stdio: 'pipe'
});

let errorBuffer = '';
let outputBuffer = '';

proc.stdout.on('data', (data) => {
  const text = data.toString();
  outputBuffer += text;
  process.stdout.write(text);
  
  // Look for module not found errors
  if (text.includes('Module not found')) {
    errorBuffer += text;
  }
});

proc.stderr.on('data', (data) => {
  const text = data.toString();
  errorBuffer += text;
  process.stderr.write(text);
});

// After 30 seconds, kill the process and report errors
setTimeout(() => {
  console.log('\n\n=== ERROR SUMMARY ===');
  
  if (errorBuffer) {
    console.log('Errors found:');
    console.log(errorBuffer);
  } else {
    console.log('No module errors found in the output');
  }
  
  proc.kill();
  process.exit(0);
}, 30000);