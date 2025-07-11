#!/usr/bin/env node

/**
 * Netlify Post-Deployment Health Check Script
 * Validates that all critical medical routes are accessible after deployment
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Routes to check
const CRITICAL_ROUTES = [
  { path: '/', name: 'Home Page', critical: true },
  { path: '/medical', name: 'Medical Portal', critical: true },
  { path: '/patients', name: 'Patients', critical: true },
  { path: '/reports', name: 'Medical Reports', critical: true },
  { path: '/studies', name: 'Studies', critical: true },
  { path: '/categories', name: 'Categories', critical: true },
  { path: '/legacy', name: 'Legacy Dashboard', critical: false },
  { path: '/legacy?demo=true', name: 'Demo Mode', critical: false },
  { path: '/api/health', name: 'API Health', critical: true },
  { path: '/api/medical', name: 'Medical API', critical: false },
  { path: '/about', name: 'About Page', critical: false },
  { path: '/features', name: 'Features Page', critical: false }
];

// Headers to check
const REQUIRED_HEADERS = [
  'x-frame-options',
  'x-content-type-options',
  'strict-transport-security'
];

class HealthChecker {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const prefix = {
      error: `${colors.red}✗${colors.reset}`,
      warning: `${colors.yellow}⚠${colors.reset}`,
      success: `${colors.green}✓${colors.reset}`,
      info: `${colors.blue}ℹ${colors.reset}`,
      section: `${colors.cyan}▶ ${message}${colors.reset}`
    };

    if (type === 'section') {
      console.log('\n' + prefix[type]);
      return;
    }

    console.log(`  ${prefix[type] || ''} ${message}`);
  }

  checkUrl(urlString) {
    return new Promise((resolve) => {
      const url = new URL(urlString);
      const protocol = url.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          'User-Agent': 'SYMFARMIA-Health-Check/1.0'
        },
        timeout: 10000
      };

      const req = protocol.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data.slice(0, 1000), // First 1000 chars
            error: null
          });
        });
      });

      req.on('error', (error) => {
        resolve({
          status: 0,
          headers: {},
          data: '',
          error: error.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          status: 0,
          headers: {},
          data: '',
          error: 'Request timeout'
        });
      });

      req.end();
    });
  }

  async checkRoute(route) {
    const url = `${this.baseUrl}${route.path}`;
    this.log(`Checking ${route.name} at ${route.path}...`);
    
    try {
      const result = await this.checkUrl(url);
      
      if (result.error) {
        this.log(`Failed: ${result.error}`, 'error');
        this.results.failed.push({
          ...route,
          error: result.error,
          url
        });
        return false;
      }

      // Check status code
      if (result.status === 200) {
        this.log(`Success: Status ${result.status}`, 'success');
        
        // Check for 404 indicators in content
        if (result.data.includes('404') || result.data.includes('Not Found')) {
          this.log('Warning: Page contains 404 text', 'warning');
          this.results.warnings.push({
            ...route,
            warning: 'Page returns 200 but contains 404 text',
            url
          });
        }
        
        this.results.passed.push({
          ...route,
          status: result.status,
          url
        });
        return true;
      } else if (result.status === 401 || result.status === 403) {
        // Authentication required - this is expected for protected routes
        this.log(`Auth required: Status ${result.status}`, 'warning');
        this.results.warnings.push({
          ...route,
          warning: `Authentication required (${result.status})`,
          url
        });
        return true;
      } else if (result.status === 301 || result.status === 302) {
        // Redirect - check if it's expected
        const location = result.headers.location;
        this.log(`Redirect to: ${location}`, 'warning');
        this.results.warnings.push({
          ...route,
          warning: `Redirects to ${location}`,
          url
        });
        return true;
      } else {
        this.log(`Failed: Status ${result.status}`, 'error');
        this.results.failed.push({
          ...route,
          error: `HTTP ${result.status}`,
          url
        });
        return false;
      }
    } catch (error) {
      this.log(`Error: ${error.message}`, 'error');
      this.results.failed.push({
        ...route,
        error: error.message,
        url
      });
      return false;
    }
  }

  async checkHeaders() {
    this.log('Checking security headers...', 'section');
    
    const url = this.baseUrl;
    const result = await this.checkUrl(url);
    
    if (result.error) {
      this.log('Could not check headers: ' + result.error, 'error');
      return;
    }

    REQUIRED_HEADERS.forEach(header => {
      if (result.headers[header]) {
        this.log(`Found ${header}: ${result.headers[header]}`, 'success');
      } else {
        this.log(`Missing security header: ${header}`, 'warning');
        this.results.warnings.push({
          type: 'header',
          warning: `Missing security header: ${header}`
        });
      }
    });
  }

  async checkResponseTime(url) {
    const start = Date.now();
    await this.checkUrl(url);
    const duration = Date.now() - start;
    return duration;
  }

  async performanceCheck() {
    this.log('Checking performance...', 'section');
    
    const testUrl = this.baseUrl;
    const times = [];
    
    // Run 3 requests
    for (let i = 0; i < 3; i++) {
      const time = await this.checkResponseTime(testUrl);
      times.push(time);
      this.log(`Request ${i + 1}: ${time}ms`);
    }
    
    const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    this.log(`Average response time: ${avgTime}ms`, avgTime < 1000 ? 'success' : 'warning');
    
    if (avgTime > 2000) {
      this.results.warnings.push({
        type: 'performance',
        warning: `Slow response time: ${avgTime}ms average`
      });
    }
  }

  generateReport() {
    const duration = Math.round((Date.now() - this.startTime) / 1000);
    
    console.log('\n' + '='.repeat(60));
    console.log(`${colors.cyan}NETLIFY DEPLOYMENT HEALTH CHECK REPORT${colors.reset}`);
    console.log('='.repeat(60));
    console.log(`URL: ${this.baseUrl}`);
    console.log(`Duration: ${duration}s`);
    console.log(`\n${colors.green}✓ Passed: ${this.results.passed.length}${colors.reset}`);
    console.log(`${colors.yellow}⚠ Warnings: ${this.results.warnings.length}${colors.reset}`);
    console.log(`${colors.red}✗ Failed: ${this.results.failed.length}${colors.reset}`);
    
    // Critical failures
    const criticalFailures = this.results.failed.filter(r => r.critical);
    if (criticalFailures.length > 0) {
      console.log(`\n${colors.red}CRITICAL FAILURES:${colors.reset}`);
      criticalFailures.forEach(failure => {
        console.log(`  - ${failure.name}: ${failure.error}`);
      });
    }
    
    // Non-critical failures
    const nonCriticalFailures = this.results.failed.filter(r => !r.critical);
    if (nonCriticalFailures.length > 0) {
      console.log(`\n${colors.yellow}NON-CRITICAL FAILURES:${colors.reset}`);
      nonCriticalFailures.forEach(failure => {
        console.log(`  - ${failure.name}: ${failure.error}`);
      });
    }
    
    // Warnings
    if (this.results.warnings.length > 0) {
      console.log(`\n${colors.yellow}WARNINGS:${colors.reset}`);
      this.results.warnings.forEach(warning => {
        if (warning.type) {
          console.log(`  - ${warning.warning}`);
        } else {
          console.log(`  - ${warning.name}: ${warning.warning}`);
        }
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (criticalFailures.length === 0) {
      console.log(`${colors.green}✓ HEALTH CHECK PASSED${colors.reset}`);
      return 0;
    } else {
      console.log(`${colors.red}✗ HEALTH CHECK FAILED${colors.reset}`);
      return 1;
    }
  }

  async run() {
    console.log(`${colors.cyan}Starting health check for: ${this.baseUrl}${colors.reset}\n`);
    
    // Check all routes
    for (const route of CRITICAL_ROUTES) {
      await this.checkRoute(route);
    }
    
    // Check headers
    await this.checkHeaders();
    
    // Performance check
    await this.performanceCheck();
    
    // Generate report
    const exitCode = this.generateReport();
    process.exit(exitCode);
  }
}

// Main execution
const baseUrl = process.argv[2] || process.env.DEPLOYMENT_URL || 'https://symfarmia.netlify.app';

if (!baseUrl) {
  console.error(`${colors.red}Error: No URL provided${colors.reset}`);
  console.log('Usage: node netlify-health-check.js <deployment-url>');
  console.log('Or set DEPLOYMENT_URL environment variable');
  process.exit(1);
}

const checker = new HealthChecker(baseUrl);
checker.run().catch(error => {
  console.error(`${colors.red}Unexpected error: ${error.message}${colors.reset}`);
  process.exit(1);
});