#!/usr/bin/env node
/**
 * CODEX'S MEDICAL ENDPOINT GUARDIAN
 * Validates critical medical routes after build
 * Because broken medical APIs kill people 🩺💀
 */

const http = require('http');
const { spawn } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');

// Colors for BRUTAL output
const colors = {
  RED: '\033[0;31m',
  GREEN: '\033[0;32m',
  YELLOW: '\033[1;33m',
  BLUE: '\033[0;34m',
  PURPLE: '\033[0;35m',
  CYAN: '\033[0;36m',
  NC: '\033[0m' // No Color
};

// Critical medical routes that MUST work
const CRITICAL_ROUTES = [
  {
    path: '/api/medical-ai/transcription',
    method: 'GET',
    critical: true,
    timeout: 5000,
    description: 'Medical AI transcription endpoint'
  },
  {
    path: '/api/medical-ai/consultation', 
    method: 'GET',
    critical: true,
    timeout: 5000,
    description: 'Medical consultation API'
  },
  {
    path: '/api/medical',
    method: 'GET',
    critical: true,
    timeout: 3000,
    description: 'Core medical API'
  },
  {
    path: '/api/patients',
    method: 'GET',
    critical: false,
    timeout: 3000,
    description: 'Patient management API'
  },
  {
    path: '/dashboard',
    method: 'GET',
    critical: true,
    timeout: 5000,
    description: 'Medical dashboard'
  },
  {
    path: '/',
    method: 'GET',
    critical: true,
    timeout: 3000,
    description: 'Landing page'
  },
  {
    path: '/consultation',
    method: 'GET',
    critical: true,
    timeout: 5000,
    description: 'Consultation workspace'
  }
];

// Configuration
const SERVER_PORT = process.env.PORT || 3000;
const SERVER_HOST = 'localhost';
const MAX_SERVER_START_TIME = 30000; // 30 seconds
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds

class MedicalRouteValidator {
  constructor() {
    this.results = [];
    this.server = null;
    this.startTime = Date.now();
  }

  log(message, color = colors.NC) {
    console.log(`${color}${message}${colors.NC}`);
  }

  error(message) {
    this.log(`❌ ${message}`, colors.RED);
  }

  success(message) {
    this.log(`✅ ${message}`, colors.GREEN);
  }

  warning(message) {
    this.log(`⚠️  ${message}`, colors.YELLOW);
  }

  info(message) {
    this.log(`ℹ️  ${message}`, colors.BLUE);
  }

  async startDevServer() {
    this.log('🚀 Starting Next.js development server...', colors.PURPLE);
    
    return new Promise((resolve, reject) => {
      // Try to start the server
      this.server = spawn('npm', ['run', 'dev'], { 
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, PORT: SERVER_PORT }
      });

      let serverReady = false;
      const timeout = setTimeout(() => {
        if (!serverReady) {
          this.server.kill('SIGTERM');
          reject(new Error(`Server failed to start within ${MAX_SERVER_START_TIME}ms`));
        }
      }, MAX_SERVER_START_TIME);

      // Listen for server ready signal
      this.server.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Ready in') || output.includes('started server on')) {
          serverReady = true;
          clearTimeout(timeout);
          this.success(`Development server started on port ${SERVER_PORT}`);
          
          // Give server a moment to fully initialize
          setTimeout(resolve, 2000);
        }
      });

      this.server.stderr.on('data', (data) => {
        const error = data.toString();
        if (error.includes('EADDRINUSE')) {
          this.warning('Port already in use, assuming server is running...');
          serverReady = true;
          clearTimeout(timeout);
          resolve();
        }
      });

      this.server.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      this.server.on('exit', (code) => {
        if (code !== 0 && !serverReady) {
          clearTimeout(timeout);
          reject(new Error(`Server exited with code ${code}`));
        }
      });
    });
  }

  async stopDevServer() {
    if (this.server) {
      this.log('🛑 Stopping development server...', colors.YELLOW);
      
      // Graceful shutdown
      this.server.kill('SIGTERM');
      
      // Force kill after 5 seconds
      setTimeout(() => {
        if (this.server) {
          this.server.kill('SIGKILL');
        }
      }, 5000);
      
      this.server = null;
    }
  }

  async makeRequest(route) {
    const url = `http://${SERVER_HOST}:${SERVER_PORT}${route.path}`;
    
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const req = http.request(url, { method: route.method }, (res) => {
        const responseTime = Date.now() - startTime;
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            responseTime,
            headers: res.headers,
            data: data.substring(0, 200) // First 200 chars
          });
        });
      });

      req.setTimeout(route.timeout, () => {
        req.destroy();
        reject(new Error(`Timeout after ${route.timeout}ms`));
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  }

  async validateRoute(route, attempt = 1) {
    const startTime = Date.now();
    
    try {
      this.info(`Testing ${route.path} (${route.method}) - Attempt ${attempt}/${RETRY_ATTEMPTS}`);
      
      const response = await this.makeRequest(route);
      const responseTime = Date.now() - startTime;
      
      // Check if response is acceptable
      const isSuccess = response.statusCode >= 200 && response.statusCode < 400;
      const isRedirect = response.statusCode >= 300 && response.statusCode < 400;
      
      if (isSuccess || isRedirect) {
        this.success(`${route.path} - ${response.statusCode} (${responseTime}ms)`);
        
        return {
          route: route.path,
          method: route.method,
          status: 'SUCCESS',
          statusCode: response.statusCode,
          responseTime,
          critical: route.critical,
          description: route.description,
          attempt
        };
      } else {
        throw new Error(`HTTP ${response.statusCode}`);
      }
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Retry logic for critical routes
      if (route.critical && attempt < RETRY_ATTEMPTS) {
        this.warning(`${route.path} failed (attempt ${attempt}), retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return this.validateRoute(route, attempt + 1);
      }
      
      this.error(`${route.path} - FAILED: ${error.message} (${responseTime}ms)`);
      
      return {
        route: route.path,
        method: route.method,
        status: 'FAILED',
        error: error.message,
        responseTime,
        critical: route.critical,
        description: route.description,
        attempt
      };
    }
  }

  async validateAllRoutes() {
    this.log('🩺 Validating critical medical routes...', colors.CYAN);
    this.log('========================================', colors.CYAN);
    
    const results = [];
    
    for (const route of CRITICAL_ROUTES) {
      const result = await this.validateRoute(route);
      results.push(result);
      
      // Small delay between requests to avoid overwhelming server
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
  }

  generateReport(results) {
    const totalTime = Date.now() - this.startTime;
    const successCount = results.filter(r => r.status === 'SUCCESS').length;
    const failureCount = results.filter(r => r.status === 'FAILED').length;
    const criticalFailures = results.filter(r => r.status === 'FAILED' && r.critical);
    
    this.log('========================================', colors.CYAN);
    this.log('📊 MEDICAL ROUTE VALIDATION REPORT', colors.PURPLE);
    this.log('========================================', colors.CYAN);
    
    this.log(`⏱️  Total validation time: ${totalTime}ms`, colors.BLUE);
    this.log(`✅ Successful routes: ${successCount}/${results.length}`, colors.GREEN);
    this.log(`❌ Failed routes: ${failureCount}/${results.length}`, colors.RED);
    this.log(`🚨 Critical failures: ${criticalFailures.length}`, colors.RED);
    
    if (results.length > 0) {
      this.log('\n📋 Detailed Results:', colors.BLUE);
      results.forEach(result => {
        const icon = result.status === 'SUCCESS' ? '✅' : '❌';
        const criticalFlag = result.critical ? '🚨' : '📄';
        const color = result.status === 'SUCCESS' ? colors.GREEN : colors.RED;
        
        this.log(`  ${icon} ${criticalFlag} ${result.route} (${result.responseTime}ms)`, color);
        if (result.error) {
          this.log(`    Error: ${result.error}`, colors.RED);
        }
      });
    }
    
    // Performance analysis
    const avgResponseTime = results
      .filter(r => r.status === 'SUCCESS')
      .reduce((sum, r) => sum + r.responseTime, 0) / successCount || 0;
    
    this.log(`\n📈 Average response time: ${Math.round(avgResponseTime)}ms`, colors.BLUE);
    
    if (avgResponseTime > 2000) {
      this.warning('Routes are responding slowly (>2s average)');
    }
    
    return {
      success: criticalFailures.length === 0,
      totalRoutes: results.length,
      successCount,
      failureCount,
      criticalFailures: criticalFailures.length,
      avgResponseTime,
      results
    };
  }

  async run() {
    try {
      this.log('🔥 CODEX MEDICAL ROUTE VALIDATOR INITIATED', colors.PURPLE);
      this.log(`📅 ${new Date().toISOString()}`, colors.BLUE);
      
      // Start development server
      await this.startDevServer();
      
      // Run validation
      const results = await this.validateAllRoutes();
      
      // Generate report
      const report = this.generateReport(results);
      
      // Stop server
      await this.stopDevServer();
      
      // Exit with appropriate code
      if (report.success) {
        this.success('🎯 All critical medical routes validated successfully!');
        process.exit(0);
      } else {
        this.error(`💀 ${report.criticalFailures} critical medical routes failed!`);
        this.error('Medical system is NOT safe for deployment!');
        process.exit(1);
      }
      
    } catch (error) {
      this.error(`Fatal error during validation: ${error.message}`);
      await this.stopDevServer();
      process.exit(1);
    }
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Validation interrupted');
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Validation terminated');
  process.exit(1);
});

// Run the validator
if (require.main === module) {
  const validator = new MedicalRouteValidator();
  validator.run();
}

module.exports = MedicalRouteValidator;