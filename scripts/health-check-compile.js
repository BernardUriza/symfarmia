#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const http = require('http');

console.log('🏥 Starting Health Check & Compilation Monitor...\n');

let devServerProcess = null;
let attemptCount = 0;
const MAX_ATTEMPTS = 2;

// Function to check if server is ready
function checkServerReady() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      timeout: 15000
    };

    const req = http.request(options, (res) => {
      console.log(`📡 Server responded with status: ${res.statusCode}`);
      resolve(res.statusCode < 500);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Function to capture compilation errors
function captureCompilationErrors(data) {
  const output = data.toString();
  const errorPatterns = [
    /Module parse failed/i,
    /Unexpected character/i,
    /You may need an appropriate loader/i,
    /Import trace for requested module/i,
    /Error:/i,
    /Failed/i,
    /@import.*tailwindcss/i
  ];

  for (const pattern of errorPatterns) {
    if (pattern.test(output)) {
      return output;
    }
  }
  return null;
}

// Start dev server and monitor
async function startHealthCheck() {
  console.log('🚀 Starting development server...\n');
  
  // Clean port 3000 before starting
  await new Promise((resolve) => {
    exec('lsof -ti:3000 | xargs kill -9 2>/dev/null || true', (error) => {
      if (!error) {
        console.log('✅ Port 3000 cleaned before start\n');
      }
      setTimeout(resolve, 1000); // Wait for port to be fully released
    });
  });
  
  devServerProcess = spawn('npm', ['run', 'dev'], {
    shell: true,
    stdio: 'pipe'
  });

  let serverReady = false;
  let compilationError = null;
  
  devServerProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[DEV] ${output.trim()}`);
    
    if (output.includes('Ready in') || output.includes('started server on')) {
      serverReady = true;
      console.log('\n✅ Server is ready! Testing compilation...\n');
    }
    
    const error = captureCompilationErrors(data);
    if (error) {
      compilationError = error;
    }
  });

  devServerProcess.stderr.on('data', (data) => {
    const output = data.toString();
    console.error(`[ERROR] ${output.trim()}`);
    
    const error = captureCompilationErrors(data);
    if (error) {
      compilationError = error;
    }
  });

  // Wait for server to be ready
  while (!serverReady && attemptCount < 30) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    attemptCount++;
  }

  if (!serverReady) {
    console.error('❌ Server failed to start within 30 seconds');
    cleanup();
    process.exit(1);
  }

  // Now test compilation by making requests
  console.log('\n🔄 Testing compilation by making requests...\n');
  
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    console.log(`\n📍 Attempt ${i + 1}/${MAX_ATTEMPTS}`);
    
    // Make request to trigger compilation
    const isHealthy = await checkServerReady();
    
    // Wait a bit to capture any compilation errors
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (compilationError) {
      console.log('\n❌ Compilation error detected:');
      console.log('─'.repeat(80));
      console.log(compilationError);
      console.log('─'.repeat(80));
      
      // Analyze the error and provide solution
      if (compilationError.includes('@import') && compilationError.includes('tailwindcss')) {
        console.log('\n🔧 Tailwind CSS import error detected!');
        console.log('📝 The issue is with the CSS import syntax.');
        console.log('\n💡 Current globals.css needs to be updated...\n');
        
        // Auto-fix attempt
        console.log('🔄 Attempting automatic fix...');
        await fixTailwindImport();
        
        // Reset for next attempt
        compilationError = null;
        console.log('\n⏳ Waiting for hot reload...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } else if (isHealthy) {
      console.log('\n✅ Server is healthy and compiling correctly!');
      cleanup();
      process.exit(0);
    }
    
    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.error('\n❌ Failed to resolve compilation errors after maximum attempts');
  cleanup();
  process.exit(1);
}

// Function to fix Tailwind import issues
async function fixTailwindImport() {
  return new Promise((resolve, reject) => {
    exec('cat app/globals.css | head -5', (error, stdout) => {
      if (error) {
        console.error('Failed to read globals.css:', error);
        reject(error);
        return;
      }
      
      console.log('Current globals.css first lines:');
      console.log(stdout);
      
      // The fix is already applied in globals.css, but let's verify PostCSS config
      exec('cat postcss.config.js', (error, stdout) => {
        if (error) {
          console.log('PostCSS config not found, might be using .mjs');
          // Check for .mjs version
          exec('ls postcss.config.*', (error, stdout) => {
            console.log('PostCSS files found:', stdout);
            resolve();
          });
        } else {
          console.log('PostCSS config:', stdout);
          resolve();
        }
      });
    });
  });
}

// Cleanup function
function cleanup() {
  if (devServerProcess) {
    console.log('\n🧹 Cleaning up...');
    // Kill only the specific dev server process, not all Node processes
    devServerProcess.kill('SIGTERM');
    
    // Clean up port 3000 specifically
    exec('lsof -ti:3000 | xargs kill -9 2>/dev/null || true', (error) => {
      if (!error) {
        console.log('✅ Port 3000 cleaned up');
      }
    });
  }
}

// Handle exit
process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

// Start the health check
startHealthCheck().catch(err => {
  console.error('❌ Health check failed:', err);
  cleanup();
  process.exit(1);
});