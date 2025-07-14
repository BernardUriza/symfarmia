#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const puppeteer = require('puppeteer');

console.log('🏥 Starting Health Check & Compilation Monitor with Netlify Dev...\n');

let devServerProcess = null;
let browser = null;
let attemptCount = 0;
const MAX_ATTEMPTS = 3;

// Function to check if server is ready via HTTP
function checkServerReady() {
  return new Promise((resolve) => {
    const http = require('http');
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

// Function to capture browser console errors
async function captureBrowserErrors() {
  const errors = [];
  const warnings = [];
  const logs = [];
  
  try {
    console.log('🌐 Launching headless browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-features=IsolateOrigins', '--disable-site-isolation-trials']
    });
    
    const page = await browser.newPage();
    
    // Capture console messages
    page.on('console', async (msg) => {
      const type = msg.type();
      let text = msg.text();
      
      // Try to get more details from the message
      try {
        const args = await Promise.all(msg.args().map(arg => arg.jsonValue().catch(() => 'Unable to serialize')));
        if (args.length > 0 && args[0] !== text) {
          text = args.join(' ');
        }
      } catch (e) {
        // Keep original text if we can't get more details
      }
      
      if (type === 'error') {
        errors.push(text);
        console.log(`🔴 [BROWSER ERROR] ${text}`);
      } else if (type === 'warning') {
        warnings.push(text);
        console.log(`🟡 [BROWSER WARN] ${text}`);
      } else if (type === 'log' && text.toLowerCase().includes('error')) {
        logs.push(text);
        console.log(`🟠 [BROWSER LOG] ${text}`);
      }
    });
    
    // Capture page errors
    page.on('pageerror', (error) => {
      errors.push(error.toString());
      console.log(`💥 [PAGE ERROR] ${error}`);
    });
    
    // Capture request failures
    page.on('requestfailed', (request) => {
      const failure = `${request.failure().errorText} ${request.url()}`;
      errors.push(failure);
      console.log(`❌ [REQUEST FAILED] ${failure}`);
    });
    
    console.log('📱 Navigating to http://localhost:3000...');
    
    try {
      // Set viewport
      await page.setViewport({ width: 1280, height: 720 });
      
      // Go to page with less strict waiting
      await page.goto('http://localhost:3000', {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });
      
      // Wait a bit for any JS errors to appear
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try to get React errors from the page
      const reactErrors = await page.evaluate(() => {
        const errorElements = document.querySelectorAll('[data-nextjs-error], .error-boundary, #__next-build-error-boundary');
        return Array.from(errorElements).map(el => el.textContent);
      });
      
      if (reactErrors.length > 0) {
        reactErrors.forEach(error => {
          errors.push(`React Error: ${error}`);
          console.log(`⚛️ [REACT ERROR] ${error}`);
        });
      }
      
    } catch (navError) {
      errors.push(`Navigation error: ${navError.message}`);
      console.log(`🚫 [NAVIGATION ERROR] ${navError.message}`);
    }
    
    await browser.close();
    browser = null;
    
    return { errors, warnings, logs };
  } catch (error) {
    console.error('❌ Browser automation failed:', error);
    if (browser) {
      await browser.close();
      browser = null;
    }
    return { errors: [error.message], warnings: [], logs: [] };
  }
}

// Start dev server and monitor
async function startHealthCheck() {
  console.log('🚀 Starting development server...\n');
  
  // Clean ports 3000 and 8888 before starting - gracefully
  await new Promise((resolve) => {
    // First try to identify if processes are ours
    exec('lsof -i:3000 -i:8888 | grep -E "node|netlify" | awk \'{print $2}\' | sort -u', (error, stdout) => {
      if (stdout && stdout.trim()) {
        const pids = stdout.trim().split('\n');
        console.log(`Found processes on ports: ${pids.join(', ')}`);
        // Try graceful shutdown first (SIGTERM)
        pids.forEach(pid => {
          try {
            process.kill(parseInt(pid), 'SIGTERM');
          } catch (e) {
            // Process might not exist or we don't have permission
          }
        });
        console.log('✅ Sent graceful shutdown signal to processes\n');
      }
      setTimeout(resolve, 2000); // Give processes time to shut down gracefully
    });
  });
  
  devServerProcess = spawn('netlify', ['dev'], {
    shell: true,
    stdio: 'pipe'
  });

  let serverReady = false;
  let compilationError = null;
  
  devServerProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[DEV] ${output.trim()}`);
    
    if (output.includes('Ready in') || output.includes('started server on') || output.includes('Server now ready on') || output.includes('Waiting for framework port')) {
      serverReady = true;
      console.log('\n✅ Server is ready! Testing compilation...\n');
    }
  });

  devServerProcess.stderr.on('data', (data) => {
    const output = data.toString();
    console.error(`[ERROR] ${output.trim()}`);
    
    // Capture webpack module parse errors
    if (output.includes('Module parse failed') || output.includes('You may need an appropriate loader')) {
      compilationError = output;
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

  // Now test compilation and browser errors
  console.log('\n🔄 Testing compilation and browser console...\n');
  
  let hasErrors = false;
  
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    console.log(`\n📍 Attempt ${i + 1}/${MAX_ATTEMPTS}`);
    console.log('─'.repeat(80));
    
    // First check if server responds
    const isHealthy = await checkServerReady();
    
    if (!isHealthy) {
      console.log('⚠️  Server not responding, waiting...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      continue;
    }
    
    // Check for compilation errors from stderr
    if (compilationError) {
      hasErrors = true;
      console.log('\n❌ Webpack compilation error detected:');
      console.log('─'.repeat(80));
      console.log(compilationError);
      console.log('─'.repeat(80));
      compilationError = null; // Reset for next attempt
    }
    
    // Capture browser console errors
    const { errors, warnings, logs } = await captureBrowserErrors();
    
    if (errors.length > 0) {
      hasErrors = true;
      console.log('\n❌ Browser errors detected:');
      console.log('─'.repeat(80));
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
      console.log('─'.repeat(80));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  Browser warnings:');
      warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }
    
    if (errors.length === 0) {
      console.log('\n✅ No browser console errors detected!');
      if (i > 0) { // If we had to retry, consider it success after one clean run
        cleanup();
        process.exit(0);
      }
    }
    
    // Wait before next attempt
    if (i < MAX_ATTEMPTS - 1) {
      console.log('\n⏳ Waiting before next attempt...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  if (hasErrors) {
    console.error('\n❌ Browser console errors persist after maximum attempts');
    cleanup();
    process.exit(1);
  } else {
    console.log('\n✅ All checks passed! No browser errors detected.');
    cleanup();
    process.exit(0);
  }
}

// Cleanup function
async function cleanup() {
  console.log('\n🧹 Cleaning up...');
  
  if (browser) {
    await browser.close();
  }
  
  if (devServerProcess) {
    // First try graceful shutdown
    devServerProcess.kill('SIGTERM');
    
    // Wait a bit for graceful shutdown
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if process is still running and force kill only if necessary
    if (!devServerProcess.killed) {
      console.log('⚠️  Process didn\'t terminate gracefully, forcing shutdown...');
      devServerProcess.kill('SIGKILL');
    }
    
    // Only clean up specific netlify dev processes, not all Node processes
    exec('lsof -i:3000 -i:8888 | grep "netlify dev" | awk \'{print $2}\' | sort -u', (error, stdout) => {
      if (stdout && stdout.trim()) {
        const pids = stdout.trim().split('\n');
        pids.forEach(pid => {
          try {
            process.kill(parseInt(pid), 'SIGTERM');
          } catch (e) {
            // Process might already be gone
          }
        });
        console.log('✅ Netlify dev processes cleaned up');
      }
    });
  }
}

// Handle exit
process.on('SIGINT', async () => {
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cleanup();
  process.exit(0);
});

// Start the health check
startHealthCheck().catch(async err => {
  console.error('❌ Health check failed:', err);
  await cleanup();
  process.exit(1);
});