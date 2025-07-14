#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const puppeteer = require('puppeteer');

console.log('🏥 Starting Enhanced Health Check for Netlify Dev...\n');

let devServerProcess = null;
let browser = null;
let allErrors = [];

// Configuration
const CONFIG = {
  maxAttempts: 3,
  serverTimeout: 30000,
  browserTimeout: 20000,
  netlifyPort: 8888,
  nextPort: 3000
};

// Function to check if server is ready
async function waitForServer(port, timeout = 30000) {
  const http = require('http');
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}`, (res) => {
          if (res.statusCode < 500) {
            resolve(true);
          } else {
            reject(new Error(`Server returned ${res.statusCode}`));
          }
        });
        
        req.on('error', reject);
        req.setTimeout(5000, () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });
      });
      
      return true;
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return false;
}

// Enhanced browser error capture
async function captureBrowserErrors(url) {
  const errors = [];
  const warnings = [];
  const logs = [];
  
  try {
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins',
        '--disable-site-isolation-trials'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    // Enhanced console capture
    page.on('console', async (msg) => {
      const type = msg.type();
      let text = msg.text();
      
      try {
        const args = await Promise.all(
          msg.args().map(arg => 
            arg.jsonValue().catch(() => arg.toString())
          )
        );
        if (args.length > 0) {
          text = args.join(' ');
        }
      } catch (e) {}
      
      if (type === 'error') {
        errors.push(text);
        console.log(`🔴 [BROWSER ERROR] ${text}`);
      } else if (type === 'warning') {
        warnings.push(text);
        console.log(`🟡 [BROWSER WARN] ${text}`);
      } else if (text.toLowerCase().includes('error')) {
        logs.push(text);
        console.log(`🟠 [BROWSER LOG] ${text}`);
      }
    });
    
    // Capture page errors
    page.on('pageerror', (error) => {
      const errorText = error.toString();
      errors.push(errorText);
      console.log(`💥 [PAGE ERROR] ${errorText}`);
    });
    
    // Capture request failures
    page.on('requestfailed', (request) => {
      const failure = `${request.failure().errorText} ${request.url()}`;
      if (!failure.includes('net::ERR_ABORTED')) { // Ignore aborted requests
        errors.push(failure);
        console.log(`❌ [REQUEST FAILED] ${failure}`);
      }
    });
    
    // Capture response errors
    page.on('response', (response) => {
      if (response.status() >= 400 && !response.url().includes('_next/webpack-hmr')) {
        const error = `HTTP ${response.status()} - ${response.url()}`;
        errors.push(error);
        console.log(`📛 [HTTP ERROR] ${error}`);
      }
    });
    
    console.log(`📱 Navigating to ${url}...`);
    
    try {
      const response = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: CONFIG.browserTimeout
      });
      
      // Check response status
      if (response && response.status() >= 400) {
        errors.push(`Page returned status ${response.status()}`);
      }
      
      // Wait for any async errors
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check for React error boundaries
      const reactErrors = await page.evaluate(() => {
        const errorElements = document.querySelectorAll(
          '[data-nextjs-error], .error-boundary, #__next-build-error-boundary'
        );
        return Array.from(errorElements).map(el => el.textContent || el.innerText);
      });
      
      if (reactErrors.length > 0) {
        reactErrors.forEach(error => {
          errors.push(`React Error: ${error}`);
          console.log(`⚛️ [REACT ERROR] ${error}`);
        });
      }
      
      // Check if page has content
      const hasContent = await page.evaluate(() => {
        const body = document.body;
        return body && body.textContent && body.textContent.trim().length > 0;
      });
      
      if (!hasContent) {
        errors.push('Page appears to be empty');
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
    if (browser) await browser.close();
    return { 
      errors: [`Browser automation error: ${error.message}`], 
      warnings: [], 
      logs: [] 
    };
  }
}

// Main health check function
async function runHealthCheck() {
  console.log('🚀 Starting Netlify dev server...\n');
  
  // Clean ports before starting
  await new Promise((resolve) => {
    exec(`lsof -ti:${CONFIG.nextPort} | xargs kill -9 2>/dev/null || true`, () => {});
    exec(`lsof -ti:${CONFIG.netlifyPort} | xargs kill -9 2>/dev/null || true`, () => {
      console.log('✅ Ports cleaned\n');
      setTimeout(resolve, 1000);
    });
  });
  
  // Start Netlify dev
  devServerProcess = spawn('netlify', ['dev', '--port', CONFIG.netlifyPort], {
    shell: true,
    stdio: 'pipe'
  });
  
  let serverErrors = [];
  let serverReady = false;
  
  // Capture server output
  devServerProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[NETLIFY] ${output.trim()}`);
    
    if (output.includes('Local dev server ready') || 
        output.includes('Server now ready on')) {
      serverReady = true;
    }
  });
  
  // Capture server errors
  devServerProcess.stderr.on('data', (data) => {
    const output = data.toString();
    console.error(`[ERROR] ${output.trim()}`);
    
    // Capture webpack errors
    if (output.includes('Module parse failed') || 
        output.includes('webpack') ||
        output.includes('Error:')) {
      serverErrors.push(output);
      allErrors.push(`Server: ${output}`);
    }
  });
  
  // Wait for server
  console.log(`⏳ Waiting for Netlify dev server on port ${CONFIG.netlifyPort}...`);
  const netlifyReady = await waitForServer(CONFIG.netlifyPort, CONFIG.serverTimeout);
  
  if (!netlifyReady) {
    console.error('❌ Netlify dev server failed to start');
    await cleanup();
    process.exit(1);
  }
  
  console.log(`⏳ Waiting for Next.js on port ${CONFIG.nextPort}...`);
  const nextReady = await waitForServer(CONFIG.nextPort, CONFIG.serverTimeout);
  
  if (!nextReady) {
    console.error('❌ Next.js server failed to start');
    await cleanup();
    process.exit(1);
  }
  
  console.log('\n✅ Servers are ready! Starting health checks...\n');
  
  // Run browser tests
  let hasErrors = false;
  
  for (let i = 0; i < CONFIG.maxAttempts; i++) {
    console.log(`\n📍 Health Check ${i + 1}/${CONFIG.maxAttempts}`);
    console.log('─'.repeat(80));
    
    // Test both ports
    const urls = [
      `http://localhost:${CONFIG.netlifyPort}`,
      `http://localhost:${CONFIG.nextPort}`
    ];
    
    for (const url of urls) {
      console.log(`\n🔍 Testing ${url}...`);
      const { errors, warnings } = await captureBrowserErrors(url);
      
      if (errors.length > 0) {
        hasErrors = true;
        console.log('\n❌ Errors found:');
        errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`);
          allErrors.push(`${url}: ${error}`);
        });
      } else {
        console.log('✅ No errors detected');
      }
      
      if (warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        warnings.forEach((warning, index) => {
          console.log(`  ${index + 1}. ${warning}`);
        });
      }
    }
    
    if (i < CONFIG.maxAttempts - 1 && hasErrors) {
      console.log('\n⏳ Waiting before next attempt...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  // Final report
  console.log('\n' + '═'.repeat(80));
  console.log('📊 FINAL REPORT');
  console.log('═'.repeat(80));
  
  if (serverErrors.length > 0) {
    console.log('\n🔴 Server Compilation Errors:');
    serverErrors.forEach((error, index) => {
      console.log(`\n${index + 1}. ${error}`);
    });
  }
  
  if (allErrors.length > 0) {
    console.log(`\n❌ Total errors found: ${allErrors.length}`);
    console.log('\nAll errors:');
    allErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
    
    // Suggest fixes
    console.log('\n💡 Suggested fixes:');
    if (allErrors.some(e => e.includes('Module parse failed') && e.includes('@tailwind'))) {
      console.log('- CSS loader issue: Check PostCSS and Tailwind CSS configuration');
      console.log('- Try using @tailwindcss/postcss in postcss.config.js');
      console.log('- Or downgrade to Tailwind CSS v3');
    }
    if (allErrors.some(e => e.includes('webpack.cache'))) {
      console.log('- Cache issue: Run "rm -rf .next" to clear cache');
    }
  } else {
    console.log('\n✅ All health checks passed! No errors detected.');
  }
  
  console.log('═'.repeat(80));
  
  await cleanup();
  process.exit(allErrors.length > 0 ? 1 : 0);
}

// Cleanup function
async function cleanup() {
  console.log('\n🧹 Cleaning up...');
  
  if (browser) {
    await browser.close();
  }
  
  if (devServerProcess) {
    devServerProcess.kill('SIGTERM');
    
    // Clean up ports
    exec(`lsof -ti:${CONFIG.nextPort} | xargs kill -9 2>/dev/null || true`, () => {});
    exec(`lsof -ti:${CONFIG.netlifyPort} | xargs kill -9 2>/dev/null || true`, () => {
      console.log('✅ Cleanup complete');
    });
  }
}

// Handle exit signals
process.on('SIGINT', async () => {
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cleanup();
  process.exit(0);
});

// Run the health check
runHealthCheck().catch(async (err) => {
  console.error('❌ Health check failed:', err);
  await cleanup();
  process.exit(1);
});