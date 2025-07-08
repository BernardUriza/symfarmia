#!/usr/bin/env node

/**
 * Build Monitor System
 * Monitors build processes for timeouts, failures, and hanging builds
 * Logs all events to build diary for priority tracking
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class BuildMonitor {
  constructor() {
    this.buildLogPath = path.join(__dirname, '../logs/build-diary.log');
    this.buildTimeoutMs = 10 * 60 * 1000; // 10 minutes
    this.buildStartTime = null;
    this.buildProcess = null;
    this.buildId = this.generateBuildId();
    
    // Ensure logs directory exists
    this.ensureLogDirectory();
  }

  generateBuildId() {
    return `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.buildLogPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  logEvent(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      buildId: this.buildId,
      message,
      data,
      duration: this.buildStartTime ? Date.now() - this.buildStartTime : null
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    
    // Write to file
    fs.appendFileSync(this.buildLogPath, logLine);
    
    // Also log to console with colors
    const colors = {
      ERROR: '\x1b[31m',
      WARN: '\x1b[33m',
      INFO: '\x1b[36m',
      SUCCESS: '\x1b[32m',
      RESET: '\x1b[0m'
    };
    
    const color = colors[level.toUpperCase()] || colors.RESET;
    console.log(`${color}[${timestamp}] [${level.toUpperCase()}] ${message}${colors.RESET}`);
    
    if (Object.keys(data).length > 0) {
      console.log(`${color}Data: ${JSON.stringify(data, null, 2)}${colors.RESET}`);
    }
  }

  async runBuildWithMonitoring() {
    this.buildStartTime = Date.now();
    this.logEvent('INFO', 'Build started', {
      buildId: this.buildId,
      command: 'npm run build:original'
    });

    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeoutId = setTimeout(() => {
        this.logEvent('ERROR', 'Build timeout detected - killing process', {
          timeoutMs: this.buildTimeoutMs,
          duration: Date.now() - this.buildStartTime
        });
        
        if (this.buildProcess) {
          this.buildProcess.kill('SIGTERM');
          
          // Force kill if still running after 5 seconds
          setTimeout(() => {
            if (this.buildProcess && !this.buildProcess.killed) {
              this.buildProcess.kill('SIGKILL');
              this.logEvent('ERROR', 'Build process force killed', {
                signal: 'SIGKILL'
              });
            }
          }, 5000);
        }
        
        reject(new Error('Build timeout'));
      }, this.buildTimeoutMs);

      // Spawn build process
      this.buildProcess = spawn('npm', ['run', 'build:original'], {
        cwd: process.cwd(),
        stdio: ['inherit', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      this.buildProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        process.stdout.write(output);
        
        // Log significant build events
        if (output.includes('Creating an optimized production build')) {
          this.logEvent('INFO', 'Build optimization started');
        }
        if (output.includes('Compiled successfully')) {
          this.logEvent('SUCCESS', 'Build compiled successfully');
        }
        if (output.includes('Failed to compile')) {
          this.logEvent('ERROR', 'Build compilation failed');
        }
        if (output.includes('webpack.cache.PackFileCacheStrategy')) {
          this.logEvent('WARN', 'Webpack cache strategy warning detected', {
            warning: output.trim()
          });
        }
      });

      this.buildProcess.stderr.on('data', (data) => {
        const error = data.toString();
        stderr += error;
        process.stderr.write(error);
        
        this.logEvent('ERROR', 'Build error output', {
          error: error.trim()
        });
      });

      this.buildProcess.on('close', (code) => {
        clearTimeout(timeoutId);
        const duration = Date.now() - this.buildStartTime;
        
        if (code === 0) {
          this.logEvent('SUCCESS', 'Build completed successfully', {
            exitCode: code,
            duration
          });
          resolve({ success: true, code, duration });
        } else {
          this.logEvent('ERROR', 'Build failed with exit code', {
            exitCode: code,
            duration,
            stdout: stdout.substring(stdout.length - 1000), // Last 1000 chars
            stderr: stderr.substring(stderr.length - 1000)  // Last 1000 chars
          });
          reject(new Error(`Build failed with exit code ${code}`));
        }
      });

      this.buildProcess.on('error', (error) => {
        clearTimeout(timeoutId);
        this.logEvent('ERROR', 'Build process error', {
          error: error.message,
          stack: error.stack
        });
        reject(error);
      });

      // Monitor for hanging builds (no output for extended period)
      let lastOutputTime = Date.now();
      const hangCheckInterval = setInterval(() => {
        const timeSinceLastOutput = Date.now() - lastOutputTime;
        const hangThreshold = 5 * 60 * 1000; // 5 minutes
        
        if (timeSinceLastOutput > hangThreshold) {
          this.logEvent('WARN', 'Build appears to be hanging - no output for extended period', {
            timeSinceLastOutput,
            hangThreshold
          });
          // Reset timer to avoid spam
          lastOutputTime = Date.now();
        }
      }, 30000); // Check every 30 seconds

      // Update last output time when we get output
      this.buildProcess.stdout.on('data', () => {
        lastOutputTime = Date.now();
      });
      
      this.buildProcess.stderr.on('data', () => {
        lastOutputTime = Date.now();
      });

      this.buildProcess.on('close', () => {
        clearInterval(hangCheckInterval);
      });
    });
  }

  async checkBuildHealth() {
    this.logEvent('INFO', 'Checking build health');
    
    // Check for recent build failures
    const recentFailures = this.getRecentBuildFailures();
    if (recentFailures.length > 0) {
      this.logEvent('WARN', 'Recent build failures detected', {
        failureCount: recentFailures.length,
        failures: recentFailures
      });
    }

    // Check Next.js cache health
    const nextCachePath = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextCachePath)) {
      const stats = fs.statSync(nextCachePath);
      this.logEvent('INFO', 'Next.js cache status', {
        exists: true,
        size: this.getDirectorySize(nextCachePath),
        modified: stats.mtime
      });
    } else {
      this.logEvent('WARN', 'Next.js cache directory not found');
    }

    // Check node_modules health
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      const stats = fs.statSync(nodeModulesPath);
      this.logEvent('INFO', 'Node modules status', {
        exists: true,
        modified: stats.mtime
      });
    } else {
      this.logEvent('ERROR', 'Node modules directory not found');
    }
  }

  getRecentBuildFailures(hoursBack = 24) {
    if (!fs.existsSync(this.buildLogPath)) {
      return [];
    }

    const logContent = fs.readFileSync(this.buildLogPath, 'utf8');
    const lines = logContent.split('\n').filter(line => line.trim());
    const cutoffTime = Date.now() - (hoursBack * 60 * 60 * 1000);
    
    return lines
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(entry => entry && entry.level === 'ERROR' && new Date(entry.timestamp).getTime() > cutoffTime);
  }

  getDirectorySize(dirPath) {
    try {
      const stats = fs.statSync(dirPath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  async generateDailySummary() {
    const failures = this.getRecentBuildFailures(24);
    const summary = {
      date: new Date().toISOString().split('T')[0],
      totalFailures: failures.length,
      criticalIssues: failures.filter(f => f.message.includes('timeout') || f.message.includes('hanging')).length,
      recommendations: []
    };

    if (summary.totalFailures > 3) {
      summary.recommendations.push('HIGH PRIORITY: Multiple build failures detected - investigate build environment');
    }

    if (summary.criticalIssues > 0) {
      summary.recommendations.push('CRITICAL: Build timeouts/hanging detected - check system resources');
    }

    this.logEvent('INFO', 'Daily build summary generated', summary);
    return summary;
  }
}

// CLI Interface
if (require.main === module) {
  const monitor = new BuildMonitor();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'build':
      monitor.runBuildWithMonitoring()
        .then(result => {
          console.log('✅ Build monitoring completed successfully');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Build monitoring failed:', error.message);
          process.exit(1);
        });
      break;
      
    case 'health':
      monitor.checkBuildHealth()
        .then(() => {
          console.log('✅ Build health check completed');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Build health check failed:', error.message);
          process.exit(1);
        });
      break;
      
    case 'summary':
      monitor.generateDailySummary()
        .then(summary => {
          console.log('📊 Daily Summary:', JSON.stringify(summary, null, 2));
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Summary generation failed:', error.message);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: node build-monitor.js [build|health|summary]');
      console.log('  build   - Run build with monitoring');
      console.log('  health  - Check build environment health');
      console.log('  summary - Generate daily build summary');
      process.exit(1);
  }
}

module.exports = BuildMonitor;