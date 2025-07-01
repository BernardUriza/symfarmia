#!/usr/bin/env node

/**
 * SYMFARMIA - Screenshot Generator
 * Automatically captures high-quality screenshots of all app pages
 * Perfect for presentations, documentation, and investor materials
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  outputDir: './screenshots',
  viewport: {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2, // High DPI for crisp images
  },
  screenshotOptions: {
    type: 'png',
    quality: 90,
    fullPage: true,
  },
  // Pages to screenshot
  pages: [
    {
      path: '/',
      name: 'landing-page',
      title: 'Landing Page',
      waitFor: 'networkidle0',
      delay: 2000,
    },
    {
      path: '/legacy',
      name: 'dashboard',
      title: 'Main Dashboard',
      waitFor: 'networkidle0',
      delay: 3000,
    },
    {
      path: '/?demo=true',
      name: 'demo-mode',
      title: 'Demo Mode Landing',
      waitFor: 'networkidle0',
      delay: 2000,
    },
    // Add more pages as needed
  ],
  // Mobile viewport for responsive screenshots
  mobileViewport: {
    width: 375,
    height: 812,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  }
};

class ScreenshotGenerator {
  constructor() {
    this.browser = null;
    this.page = null;
    this.outputDir = CONFIG.outputDir;
  }

  async init() {
    console.log('🚀 Initializing screenshot generator...');
    
    // Create output directory
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
      console.log(`📁 Created output directory: ${this.outputDir}`);
    }

    // Launch browser
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    });

    console.log('✅ Browser launched successfully');
  }

  async captureScreenshot(pageConfig, viewport = CONFIG.viewport, suffix = '') {
    try {
      const page = await this.browser.newPage();
      
      // Set viewport
      await page.setViewport(viewport);
      
      // Set user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to page
      const url = `${CONFIG.baseUrl}${pageConfig.path}`;
      console.log(`📸 Capturing: ${pageConfig.title} (${url})`);
      
      await page.goto(url, { 
        waitUntil: pageConfig.waitFor || 'networkidle0',
        timeout: 30000 
      });
      
      // Wait for additional delay if specified
      if (pageConfig.delay) {
        await page.waitForTimeout(pageConfig.delay);
      }
      
      // Handle demo mode login if needed
      if (pageConfig.path.includes('demo=true')) {
        await this.handleDemoLogin(page);
      }
      
      // Take screenshot
      const filename = `${pageConfig.name}${suffix}.png`;
      const filepath = path.join(this.outputDir, filename);
      
      await page.screenshot({
        path: filepath,
        ...CONFIG.screenshotOptions,
      });
      
      console.log(`✅ Screenshot saved: ${filepath}`);
      
      await page.close();
      
      return filepath;
    } catch (error) {
      console.error(`❌ Error capturing ${pageConfig.title}:`, error.message);
      throw error;
    }
  }

  async handleDemoLogin(page) {
    try {
      // Wait for demo login modal or button
      await page.waitForSelector('[data-testid="demo-login"], .demo-login, button:contains("Try Demo")', { timeout: 5000 });
      
      // Click demo login if available
      const demoButton = await page.$('[data-testid="demo-login"], .demo-login, button:contains("Try Demo")');
      if (demoButton) {
        await demoButton.click();
        await page.waitForTimeout(3000); // Wait for demo login process
      }
    } catch (error) {
      console.log('⚠️ Demo login not found or failed, continuing...');
    }
  }

  async captureAllPages() {
    console.log('📸 Starting screenshot capture for all pages...');
    
    const results = [];
    
    for (const pageConfig of CONFIG.pages) {
      try {
        // Desktop screenshot
        const desktopPath = await this.captureScreenshot(pageConfig, CONFIG.viewport, '-desktop');
        results.push({ 
          page: pageConfig.title, 
          desktop: desktopPath, 
          status: 'success' 
        });
        
        // Mobile screenshot
        const mobilePath = await this.captureScreenshot(pageConfig, CONFIG.mobileViewport, '-mobile');
        results.push({ 
          page: pageConfig.title, 
          mobile: mobilePath, 
          status: 'success' 
        });
        
      } catch (error) {
        console.error(`❌ Failed to capture ${pageConfig.title}:`, error.message);
        results.push({ 
          page: pageConfig.title, 
          status: 'failed', 
          error: error.message 
        });
      }
    }
    
    return results;
  }

  async generateReport(results) {
    const reportPath = path.join(this.outputDir, 'screenshot-report.html');
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SYMFARMIA - Screenshot Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .page-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .page-title { font-size: 18px; font-weight: bold; color: #2c3e50; margin-bottom: 10px; }
        .screenshots { display: flex; gap: 20px; flex-wrap: wrap; }
        .screenshot { text-align: center; }
        .screenshot img { max-width: 300px; height: auto; border: 1px solid #ddd; border-radius: 4px; }
        .screenshot-label { margin-top: 5px; font-size: 14px; color: #666; }
        .success { color: #27ae60; }
        .failed { color: #e74c3c; }
        .timestamp { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        .stats { display: flex; justify-content: center; gap: 20px; margin: 20px 0; }
        .stat { text-align: center; padding: 10px; background: #ecf0f1; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>SYMFARMIA - Screenshot Report</h1>
        
        <div class="stats">
            <div class="stat">
                <div class="success">✅ Successful</div>
                <div>${results.filter(r => r.status === 'success').length}</div>
            </div>
            <div class="stat">
                <div class="failed">❌ Failed</div>
                <div>${results.filter(r => r.status === 'failed').length}</div>
            </div>
            <div class="stat">
                <div>📊 Total</div>
                <div>${results.length}</div>
            </div>
        </div>

        ${results.map(result => `
            <div class="page-section">
                <div class="page-title ${result.status}">
                    ${result.status === 'success' ? '✅' : '❌'} ${result.page}
                </div>
                ${result.status === 'success' ? `
                    <div class="screenshots">
                        ${result.desktop ? `
                            <div class="screenshot">
                                <img src="${path.basename(result.desktop)}" alt="${result.page} - Desktop">
                                <div class="screenshot-label">Desktop (1920x1080)</div>
                            </div>
                        ` : ''}
                        ${result.mobile ? `
                            <div class="screenshot">
                                <img src="${path.basename(result.mobile)}" alt="${result.page} - Mobile">
                                <div class="screenshot-label">Mobile (375x812)</div>
                            </div>
                        ` : ''}
                    </div>
                ` : `
                    <div class="failed">Error: ${result.error}</div>
                `}
            </div>
        `).join('')}
        
        <div class="timestamp">
            Generated on ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(reportPath, html);
    console.log(`📊 Report generated: ${reportPath}`);
    
    return reportPath;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser closed');
    }
  }

  async run() {
    try {
      await this.init();
      const results = await this.captureAllPages();
      const reportPath = await this.generateReport(results);
      
      console.log('\n🎉 Screenshot generation completed!');
      console.log(`📁 Screenshots saved to: ${this.outputDir}`);
      console.log(`📊 Report available at: ${reportPath}`);
      
      // Summary
      const successful = results.filter(r => r.status === 'success').length;
      const failed = results.filter(r => r.status === 'failed').length;
      
      console.log(`\n📈 Summary:`);
      console.log(`   ✅ Successful: ${successful}`);
      console.log(`   ❌ Failed: ${failed}`);
      console.log(`   📊 Total: ${results.length}`);
      
    } catch (error) {
      console.error('💥 Fatal error:', error.message);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// CLI usage
if (require.main === module) {
  const generator = new ScreenshotGenerator();
  generator.run();
}

module.exports = ScreenshotGenerator;