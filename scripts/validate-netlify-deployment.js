#!/usr/bin/env node

/**
 * Netlify Deployment Validation Script
 * Validates all routes and configurations before deployment to prevent 404 errors
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Medical app routes to validate
const MEDICAL_ROUTES = [
  '/',
  '/medical',
  '/patients',
  '/reports',
  '/studies',
  '/categories',
  '/legacy',
  '/dashboard',
  '/about',
  '/features',
  '/contact',
  '/demo',
  '/consultation',
  '/analytics',
  '/medical-ai-demo'
];

// API routes to validate
const API_ROUTES = [
  '/api/health',
  '/api/medical',
  '/api/patients',
  '/api/medicalReports',
  '/api/studies',
  '/api/study-types',
  '/api/categories',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/callback'
];

// Required files for Netlify deployment
const REQUIRED_FILES = [
  'netlify.toml',
  'public/_redirects',
  'next.config.js',
  'middleware.js',
  'app/not-found.js',
  'app/layout.js',
  'app/page.js'
];

// Environment variables to check
const REQUIRED_ENV_VARS = [
  'AUTH0_DOMAIN',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET',
  'AUTH0_BASE_URL',
  'DATABASE_URL'
];

class NetlifyValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.successes = [];
  }

  log(message, type = 'info') {
    const prefix = {
      error: `${colors.red}✗ ERROR:${colors.reset}`,
      warning: `${colors.yellow}⚠ WARNING:${colors.reset}`,
      success: `${colors.green}✓ SUCCESS:${colors.reset}`,
      info: `${colors.blue}ℹ INFO:${colors.reset}`,
      section: `${colors.cyan}▶ ${message}${colors.reset}`
    };

    if (type === 'section') {
      console.log('\n' + prefix[type]);
      return;
    }

    console.log(`  ${prefix[type] || ''} ${message}`);
  }

  checkRequiredFiles() {
    this.log('Checking required files...', 'section');
    
    REQUIRED_FILES.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        this.successes.push(`Found ${file}`);
        this.log(`Found ${file}`, 'success');
      } else {
        this.errors.push(`Missing required file: ${file}`);
        this.log(`Missing required file: ${file}`, 'error');
      }
    });
  }

  validateNetlifyConfig() {
    this.log('Validating netlify.toml...', 'section');
    
    const configPath = path.join(process.cwd(), 'netlify.toml');
    if (!fs.existsSync(configPath)) {
      this.errors.push('netlify.toml not found');
      return;
    }

    try {
      const config = fs.readFileSync(configPath, 'utf8');
      
      // Check for required sections
      const requiredSections = ['[build]', '[[redirects]]', '[[headers]]'];
      requiredSections.forEach(section => {
        if (config.includes(section)) {
          this.log(`Found ${section} section`, 'success');
        } else {
          this.warnings.push(`Missing ${section} section in netlify.toml`);
          this.log(`Missing ${section} section`, 'warning');
        }
      });

      // Check build command
      if (config.includes('npm run build') && config.includes('npm run export')) {
        this.log('Build commands configured correctly', 'success');
      } else {
        this.errors.push('Build commands not properly configured');
        this.log('Build commands not properly configured', 'error');
      }

      // Check publish directory
      if (config.includes('publish = "out"')) {
        this.log('Publish directory set to "out"', 'success');
      } else {
        this.errors.push('Publish directory should be set to "out" for static export');
        this.log('Publish directory should be set to "out"', 'error');
      }
    } catch (error) {
      this.errors.push(`Error reading netlify.toml: ${error.message}`);
      this.log(`Error reading netlify.toml: ${error.message}`, 'error');
    }
  }

  validateRedirects() {
    this.log('Validating redirects...', 'section');
    
    const redirectsPath = path.join(process.cwd(), 'public/_redirects');
    if (!fs.existsSync(redirectsPath)) {
      this.errors.push('_redirects file not found');
      return;
    }

    try {
      const redirects = fs.readFileSync(redirectsPath, 'utf8');
      
      // Check for SPA fallback
      if (redirects.includes('/*  /index.html  200')) {
        this.log('SPA fallback redirect configured', 'success');
      } else {
        this.errors.push('Missing SPA fallback redirect');
        this.log('Missing SPA fallback redirect', 'error');
      }

      // Check medical routes
      MEDICAL_ROUTES.forEach(route => {
        if (redirects.includes(route)) {
          this.log(`Redirect for ${route} configured`, 'success');
        } else if (route !== '/') {
          this.warnings.push(`No specific redirect for ${route}`);
        }
      });
    } catch (error) {
      this.errors.push(`Error reading _redirects: ${error.message}`);
      this.log(`Error reading _redirects: ${error.message}`, 'error');
    }
  }

  checkNextConfig() {
    this.log('Checking Next.js configuration...', 'section');
    
    const configPath = path.join(process.cwd(), 'next.config.js');
    if (!fs.existsSync(configPath)) {
      this.errors.push('next.config.js not found');
      return;
    }

    try {
      const config = fs.readFileSync(configPath, 'utf8');
      
      // Check for export output
      if (config.includes("output: process.env.NETLIFY ? 'export'")) {
        this.log('Static export configured for Netlify', 'success');
      } else {
        this.errors.push('Next.js not configured for static export');
        this.log('Next.js not configured for static export', 'error');
      }

      // Check for trailing slash
      if (config.includes('trailingSlash: true')) {
        this.log('Trailing slash enabled', 'success');
      } else {
        this.warnings.push('Consider enabling trailingSlash for better routing');
        this.log('Consider enabling trailingSlash', 'warning');
      }
    } catch (error) {
      this.errors.push(`Error reading next.config.js: ${error.message}`);
      this.log(`Error reading next.config.js: ${error.message}`, 'error');
    }
  }

  checkEnvironmentVariables() {
    this.log('Checking environment variables...', 'section');
    
    const envExample = path.join(process.cwd(), '.env.example');
    const envLocal = path.join(process.cwd(), '.env.local');
    
    if (!fs.existsSync(envExample) && !fs.existsSync(envLocal)) {
      this.warnings.push('No .env.example or .env.local found');
      this.log('No environment file examples found', 'warning');
      return;
    }

    // Check for required variables
    REQUIRED_ENV_VARS.forEach(varName => {
      this.log(`Ensure ${varName} is set in Netlify environment`, 'info');
    });
  }

  validateRoutes() {
    this.log('Validating app routes...', 'section');
    
    // Check page files
    MEDICAL_ROUTES.forEach(route => {
      const routePath = route === '/' ? 'app/page.js' : `app${route}/page.js`;
      const routePathTS = route === '/' ? 'app/page.tsx' : `app${route}/page.tsx`;
      const fullPath = path.join(process.cwd(), routePath);
      const fullPathTS = path.join(process.cwd(), routePathTS);
      
      if (fs.existsSync(fullPath) || fs.existsSync(fullPathTS)) {
        this.log(`Route ${route} has page file`, 'success');
      } else if (route !== '/dashboard') { // Dashboard redirects to legacy
        this.warnings.push(`No page file for route ${route}`);
        this.log(`No page file for route ${route}`, 'warning');
      }
    });
  }

  checkMiddleware() {
    this.log('Checking middleware configuration...', 'section');
    
    const middlewarePath = path.join(process.cwd(), 'middleware.js');
    if (!fs.existsSync(middlewarePath)) {
      this.warnings.push('No middleware.js found');
      this.log('No middleware.js found', 'warning');
      return;
    }

    try {
      const middleware = fs.readFileSync(middlewarePath, 'utf8');
      
      // Check for authentication handling
      if (middleware.includes('protectedRoutes') && middleware.includes('authRoutes')) {
        this.log('Authentication routes configured in middleware', 'success');
      } else {
        this.warnings.push('Middleware may not be handling authentication properly');
        this.log('Check authentication handling in middleware', 'warning');
      }
    } catch (error) {
      this.errors.push(`Error reading middleware.js: ${error.message}`);
      this.log(`Error reading middleware.js: ${error.message}`, 'error');
    }
  }

  async runBuildTest() {
    this.log('Running build test...', 'section');
    
    try {
      this.log('Running npm run build...', 'info');
      execSync('npm run build', { stdio: 'pipe' });
      this.log('Build completed successfully', 'success');
      
      this.log('Running npm run export...', 'info');
      execSync('npm run export', { stdio: 'pipe' });
      this.log('Export completed successfully', 'success');
      
      // Check if out directory exists
      if (fs.existsSync(path.join(process.cwd(), 'out'))) {
        this.log('Export directory created', 'success');
        
        // Check for index.html
        if (fs.existsSync(path.join(process.cwd(), 'out/index.html'))) {
          this.log('index.html generated', 'success');
        } else {
          this.errors.push('index.html not found in export');
          this.log('index.html not found in export', 'error');
        }
      } else {
        this.errors.push('Export directory not created');
        this.log('Export directory not created', 'error');
      }
    } catch (error) {
      this.errors.push(`Build failed: ${error.message}`);
      this.log(`Build failed - see error above`, 'error');
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log(`${colors.cyan}NETLIFY DEPLOYMENT VALIDATION REPORT${colors.reset}`);
    console.log('='.repeat(60));
    
    console.log(`\n${colors.green}✓ Successes: ${this.successes.length}${colors.reset}`);
    console.log(`${colors.yellow}⚠ Warnings: ${this.warnings.length}${colors.reset}`);
    console.log(`${colors.red}✗ Errors: ${this.errors.length}${colors.reset}`);
    
    if (this.errors.length > 0) {
      console.log(`\n${colors.red}ERRORS FOUND:${colors.reset}`);
      this.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log(`\n${colors.yellow}WARNINGS:${colors.reset}`);
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (this.errors.length === 0) {
      console.log(`${colors.green}✓ VALIDATION PASSED - Ready for Netlify deployment${colors.reset}`);
      return 0;
    } else {
      console.log(`${colors.red}✗ VALIDATION FAILED - Fix errors before deployment${colors.reset}`);
      return 1;
    }
  }

  async run() {
    console.log(`${colors.cyan}Starting Netlify deployment validation...${colors.reset}\n`);
    
    this.checkRequiredFiles();
    this.validateNetlifyConfig();
    this.validateRedirects();
    this.checkNextConfig();
    this.checkEnvironmentVariables();
    this.validateRoutes();
    this.checkMiddleware();
    
    // Only run build test if no critical errors
    if (this.errors.length === 0) {
      await this.runBuildTest();
    }
    
    const exitCode = this.generateReport();
    process.exit(exitCode);
  }
}

// Run the validator
const validator = new NetlifyValidator();
validator.run().catch(error => {
  console.error(`${colors.red}Unexpected error: ${error.message}${colors.reset}`);
  process.exit(1);
});