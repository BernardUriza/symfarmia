#!/usr/bin/env node

/**
 * SYMFARMIA - PDF Exporter
 * Exports app pages to high-quality PDF for presentations and documentation
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  outputDir: './exports',
  pdfOptions: {
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20px',
      right: '20px',
      bottom: '20px',
      left: '20px',
    },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
        SYMFARMIA - Medical Management System
      </div>
    `,
    footerTemplate: `
      <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span> | Generated on ${new Date().toLocaleDateString()}
      </div>
    `,
  },
  // Pages to export
  pages: [
    {
      path: '/',
      name: 'landing-page',
      title: 'Landing Page',
      description: 'Main landing page with features and call-to-action',
    },
    {
      path: '/legacy',
      name: 'dashboard',
      title: 'Dashboard',
      description: 'Main application dashboard with patient management',
    },
    {
      path: '/?demo=true',
      name: 'demo-mode',
      title: 'Demo Mode',
      description: 'Interactive demo experience',
    },
  ],
};

class PDFExporter {
  constructor() {
    this.browser = null;
    this.outputDir = CONFIG.outputDir;
  }

  async init() {
    console.log('📄 Initializing PDF exporter...');
    
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
        '--disable-web-security',
        '--allow-running-insecure-content',
      ],
    });

    console.log('✅ Browser launched successfully');
  }

  async exportPageToPDF(pageConfig) {
    try {
      const page = await this.browser.newPage();
      
      // Set viewport for consistent rendering
      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 2,
      });
      
      // Navigate to page
      const url = `${CONFIG.baseUrl}${pageConfig.path}`;
      console.log(`📄 Exporting: ${pageConfig.title} (${url})`);
      
      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      // Wait for page to fully load
      await page.waitForTimeout(3000);
      
      // Handle demo mode if needed
      if (pageConfig.path.includes('demo=true')) {
        await this.handleDemoMode(page);
      }
      
      // Add custom CSS for better PDF rendering
      await page.addStyleTag({
        content: `
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .no-print { display: none !important; }
            .page-break { page-break-before: always; }
            * { box-shadow: none !important; }
          }
        `
      });
      
      // Generate PDF
      const filename = `${pageConfig.name}.pdf`;
      const filepath = path.join(this.outputDir, filename);
      
      await page.pdf({
        path: filepath,
        ...CONFIG.pdfOptions,
      });
      
      console.log(`✅ PDF exported: ${filepath}`);
      
      await page.close();
      
      return {
        page: pageConfig.title,
        path: filepath,
        status: 'success',
        description: pageConfig.description,
      };
      
    } catch (error) {
      console.error(`❌ Error exporting ${pageConfig.title}:`, error.message);
      return {
        page: pageConfig.title,
        status: 'failed',
        error: error.message,
        description: pageConfig.description,
      };
    }
  }

  async handleDemoMode(page) {
    try {
      // Look for and click demo login
      await page.waitForSelector('[data-testid="demo-login"], .demo-login', { timeout: 5000 });
      const demoButton = await page.$('[data-testid="demo-login"], .demo-login');
      if (demoButton) {
        await demoButton.click();
        await page.waitForTimeout(5000); // Wait for demo to load
      }
    } catch (error) {
      console.log('⚠️ Demo mode handling failed, continuing...');
    }
  }

  async exportAllPages() {
    console.log('📄 Starting PDF export for all pages...');
    
    const results = [];
    
    for (const pageConfig of CONFIG.pages) {
      const result = await this.exportPageToPDF(pageConfig);
      results.push(result);
    }
    
    return results;
  }

  async generateCombinedPDF(results) {
    try {
      console.log('📚 Generating combined PDF...');
      
      const page = await this.browser.newPage();
      
      // Create a combined HTML page
      const combinedHtml = this.generateCombinedHTML(results);
      
      await page.setContent(combinedHtml, { waitUntil: 'networkidle0' });
      
      const combinedPath = path.join(this.outputDir, 'SYMFARMIA-Complete.pdf');
      
      await page.pdf({
        path: combinedPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '30px',
          right: '30px',
          bottom: '30px',
          left: '30px',
        },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size: 12px; width: 100%; text-align: center; color: #2c3e50; font-weight: bold;">
            SYMFARMIA - Complete Application Overview
          </div>
        `,
        footerTemplate: `
          <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span> | Generated ${new Date().toLocaleDateString()}
          </div>
        `,
      });
      
      await page.close();
      
      console.log(`✅ Combined PDF generated: ${combinedPath}`);
      
      return combinedPath;
      
    } catch (error) {
      console.error('❌ Error generating combined PDF:', error.message);
      return null;
    }
  }

  generateCombinedHTML(results) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SYMFARMIA - Application Overview</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            color: #2c3e50;
            line-height: 1.6;
        }
        .cover-page {
            text-align: center;
            padding: 100px 0;
            page-break-after: always;
        }
        .logo {
            font-size: 48px;
            font-weight: bold;
            color: #3498db;
            margin-bottom: 20px;
        }
        .subtitle {
            font-size: 24px;
            color: #7f8c8d;
            margin-bottom: 40px;
        }
        .description {
            font-size: 16px;
            max-width: 600px;
            margin: 0 auto;
            text-align: left;
        }
        .page-overview {
            margin: 40px 0;
            padding: 30px;
            border: 1px solid #ecf0f1;
            border-radius: 8px;
            page-break-inside: avoid;
        }
        .page-title {
            font-size: 24px;
            font-weight: bold;
            color: #2980b9;
            margin-bottom: 10px;
        }
        .page-description {
            font-size: 14px;
            color: #5d6d7e;
            margin-bottom: 20px;
        }
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        .status.success {
            background: #d4edda;
            color: #155724;
        }
        .status.failed {
            background: #f8d7da;
            color: #721c24;
        }
        .toc {
            page-break-after: always;
        }
        .toc-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 30px;
            color: #2c3e50;
        }
        .toc-item {
            padding: 10px 0;
            border-bottom: 1px dotted #bdc3c7;
            display: flex;
            justify-content: space-between;
        }
        .export-info {
            margin-top: 40px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 5px;
            font-size: 12px;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <!-- Cover Page -->
    <div class="cover-page">
        <div class="logo">SYMFARMIA</div>
        <div class="subtitle">Medical Management System</div>
        <div class="description">
            <h3>Application Overview & Screenshots</h3>
            <p>This document provides a comprehensive overview of the SYMFARMIA medical management system, 
            including screenshots and descriptions of all major application pages and features.</p>
            
            <p><strong>Key Features:</strong></p>
            <ul style="text-align: left; display: inline-block;">
                <li>Patient Management System</li>
                <li>Medical Report Tracking</li>
                <li>Study Management & Categorization</li>
                <li>Interactive Demo Mode</li>
                <li>Modern Next.js Architecture</li>
                <li>Secure Authentication with Auth0</li>
            </ul>
        </div>
    </div>

    <!-- Table of Contents -->
    <div class="toc">
        <div class="toc-title">Table of Contents</div>
        ${results.map((result, index) => `
            <div class="toc-item">
                <span>${index + 1}. ${result.page}</span>
                <span class="status ${result.status}">${result.status}</span>
            </div>
        `).join('')}
    </div>

    <!-- Page Overviews -->
    ${results.map((result, index) => `
        <div class="page-overview">
            <div class="page-title">${index + 1}. ${result.page}</div>
            <div class="page-description">${result.description || 'Application page'}</div>
            <span class="status ${result.status}">
                ${result.status === 'success' ? '✅ Successfully Exported' : '❌ Export Failed'}
            </span>
            ${result.error ? `<div style="color: #e74c3c; margin-top: 10px;">Error: ${result.error}</div>` : ''}
            ${result.status === 'success' ? `<div style="margin-top: 15px; font-size: 12px; color: #7f8c8d;">Exported to: ${path.basename(result.path)}</div>` : ''}
        </div>
    `).join('')}

    <!-- Export Information -->
    <div class="export-info">
        <h4>Export Information</h4>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Pages:</strong> ${results.length}</p>
        <p><strong>Successful Exports:</strong> ${results.filter(r => r.status === 'success').length}</p>
        <p><strong>Failed Exports:</strong> ${results.filter(r => r.status === 'failed').length}</p>
        <p><strong>Export Directory:</strong> ${CONFIG.outputDir}</p>
    </div>
</body>
</html>`;
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
      const results = await this.exportAllPages();
      const combinedPdf = await this.generateCombinedPDF(results);
      
      console.log('\n🎉 PDF export completed!');
      console.log(`📁 PDFs saved to: ${this.outputDir}`);
      
      if (combinedPdf) {
        console.log(`📚 Combined PDF: ${combinedPdf}`);
      }
      
      // Summary
      const successful = results.filter(r => r.status === 'success').length;
      const failed = results.filter(r => r.status === 'failed').length;
      
      console.log(`\n📈 Summary:`);
      console.log(`   ✅ Successful: ${successful}`);
      console.log(`   ❌ Failed: ${failed}`);
      console.log(`   📊 Total: ${results.length}`);
      
      // List generated files
      console.log(`\n📄 Generated Files:`);
      results.forEach(result => {
        if (result.status === 'success') {
          console.log(`   • ${result.page}: ${path.basename(result.path)}`);
        }
      });
      
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
  const exporter = new PDFExporter();
  exporter.run();
}

module.exports = PDFExporter;