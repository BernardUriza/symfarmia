#!/usr/bin/env node

/**
 * Build Recovery System
 * Handles automatic recovery from failed/hanging builds
 * Implements cache cleaning, dependency refresh, and progressive recovery strategies
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class BuildRecovery {
  constructor() {
    this.recoveryLogPath = path.join(__dirname, '../logs/build-recovery.log');
    this.recoveryStrategies = [
      'clearNextCache',
      'clearNodeModules',
      'reinstallDependencies',
      'clearAllCaches',
      'resetGitState'
    ];
    
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.recoveryLogPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      data
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(this.recoveryLogPath, logLine);
    
    const colors = {
      ERROR: '\x1b[31m',
      WARN: '\x1b[33m',
      INFO: '\x1b[36m',
      SUCCESS: '\x1b[32m',
      RESET: '\x1b[0m'
    };
    
    const color = colors[level.toUpperCase()] || colors.RESET;
    console.log(`${color}[RECOVERY] ${message}${colors.RESET}`);
  }

  async executeCommand(command, options = {}) {
    this.log('INFO', `Executing: ${command}`);
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: process.cwd(),
        timeout: 300000, // 5 minutes
        ...options
      });
      
      if (stderr && !options.ignoreStderr) {
        this.log('WARN', 'Command stderr output', { stderr });
      }
      
      return { success: true, stdout, stderr };
    } catch (error) {
      this.log('ERROR', 'Command failed', { 
        command, 
        error: error.message,
        code: error.code 
      });
      return { success: false, error };
    }
  }

  async clearNextCache() {
    this.log('INFO', 'Clearing Next.js cache');
    
    const nextCachePath = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextCachePath)) {
      const result = await this.executeCommand(`rm -rf "${nextCachePath}"`);
      if (result.success) {
        this.log('SUCCESS', 'Next.js cache cleared');
        return true;
      }
    } else {
      this.log('INFO', 'Next.js cache directory not found');
      return true;
    }
    
    return false;
  }

  async clearNodeModules() {
    this.log('INFO', 'Clearing node_modules');
    
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      const result = await this.executeCommand(`rm -rf "${nodeModulesPath}"`);
      if (result.success) {
        this.log('SUCCESS', 'node_modules cleared');
        return true;
      }
    } else {
      this.log('INFO', 'node_modules directory not found');
      return true;
    }
    
    return false;
  }

  async reinstallDependencies() {
    this.log('INFO', 'Reinstalling dependencies');
    
    // Clear package-lock.json if it exists
    const packageLockPath = path.join(process.cwd(), 'package-lock.json');
    if (fs.existsSync(packageLockPath)) {
      await this.executeCommand(`rm -f "${packageLockPath}"`);
    }
    
    // Clear npm cache
    await this.executeCommand('npm cache clean --force');
    
    // Reinstall
    const result = await this.executeCommand('npm install');
    if (result.success) {
      this.log('SUCCESS', 'Dependencies reinstalled');
      return true;
    }
    
    return false;
  }

  async clearAllCaches() {
    this.log('INFO', 'Clearing all caches');
    
    const commands = [
      'npm cache clean --force',
      'npx next build --debug 2>&1 | head -20', // Debug info
      'rm -rf /tmp/next-*',
      'rm -rf ~/.npm/_cacache'
    ];
    
    for (const command of commands) {
      await this.executeCommand(command, { ignoreStderr: true });
    }
    
    this.log('SUCCESS', 'All caches cleared');
    return true;
  }

  async resetGitState() {
    this.log('INFO', 'Checking git state');
    
    // Check if there are uncommitted changes that might cause issues
    const statusResult = await this.executeCommand('git status --porcelain');
    if (statusResult.success && statusResult.stdout.trim()) {
      this.log('WARN', 'Uncommitted changes detected', { 
        changes: statusResult.stdout.trim() 
      });
    }
    
    // Clean untracked files that might interfere
    const cleanResult = await this.executeCommand('git clean -fd --dry-run');
    if (cleanResult.success && cleanResult.stdout.trim()) {
      this.log('INFO', 'Files that would be cleaned', { 
        files: cleanResult.stdout.trim() 
      });
      
      // Actually clean (be careful with this)
      await this.executeCommand('git clean -fd');
    }
    
    return true;
  }

  async detectBuildIssues() {
    this.log('INFO', 'Detecting build issues');
    
    const issues = [];
    
    // Check for common webpack cache issues
    const webpackCachePath = path.join(process.cwd(), '.next/cache/webpack');
    if (fs.existsSync(webpackCachePath)) {
      try {
        const files = fs.readdirSync(webpackCachePath);
        const corruptedFiles = files.filter(file => file.includes('pack_'));
        if (corruptedFiles.length > 0) {
          issues.push({
            type: 'webpack_cache_corruption',
            description: 'Webpack cache corruption detected',
            files: corruptedFiles
          });
        }
      } catch (error) {
        issues.push({
          type: 'webpack_cache_access',
          description: 'Cannot access webpack cache directory',
          error: error.message
        });
      }
    }
    
    // Check for TypeScript issues
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      try {
        const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
        if (tsconfig.include && tsconfig.include.includes('.next/types/**/*.ts')) {
          issues.push({
            type: 'tsconfig_next_types',
            description: 'TypeScript config includes .next/types which may not exist',
            recommendation: 'Remove .next/types from tsconfig include'
          });
        }
      } catch (error) {
        issues.push({
          type: 'tsconfig_parse_error',
          description: 'Cannot parse tsconfig.json',
          error: error.message
        });
      }
    }
    
    // Check for disk space
    const diskResult = await this.executeCommand('df -h .');
    if (diskResult.success) {
      const diskInfo = diskResult.stdout.split('\n')[1];
      if (diskInfo && diskInfo.includes('9')) { // 90%+ usage
        issues.push({
          type: 'disk_space_low',
          description: 'Disk space critically low',
          info: diskInfo
        });
      }
    }
    
    this.log('INFO', 'Build issues detected', { issueCount: issues.length, issues });
    return issues;
  }

  async runRecoveryStrategy(strategy) {
    this.log('INFO', `Running recovery strategy: ${strategy}`);
    
    switch (strategy) {
      case 'clearNextCache':
        return await this.clearNextCache();
      case 'clearNodeModules':
        return await this.clearNodeModules();
      case 'reinstallDependencies':
        return await this.reinstallDependencies();
      case 'clearAllCaches':
        return await this.clearAllCaches();
      case 'resetGitState':
        return await this.resetGitState();
      default:
        this.log('ERROR', `Unknown recovery strategy: ${strategy}`);
        return false;
    }
  }

  async attemptRecovery() {
    this.log('INFO', 'Starting build recovery process');
    
    // First, detect issues
    const issues = await this.detectBuildIssues();
    
    // Try recovery strategies in order
    for (const strategy of this.recoveryStrategies) {
      this.log('INFO', `Attempting recovery strategy: ${strategy}`);
      
      const success = await this.runRecoveryStrategy(strategy);
      if (success) {
        this.log('SUCCESS', `Recovery strategy successful: ${strategy}`);
        
        // Test if build works now
        this.log('INFO', 'Testing build after recovery');
        const BuildMonitor = require('./build-monitor');
        const monitor = new BuildMonitor();
        
        try {
          await monitor.runBuildWithMonitoring();
          this.log('SUCCESS', 'Build recovery completed successfully');
          return true;
        } catch (error) {
          this.log('WARN', `Build still failing after ${strategy}, trying next strategy`);
          continue;
        }
      } else {
        this.log('WARN', `Recovery strategy failed: ${strategy}`);
      }
    }
    
    this.log('ERROR', 'All recovery strategies failed');
    return false;
  }

  async emergencyRecovery() {
    this.log('ERROR', 'Starting emergency recovery - nuclear option');
    
    // Clear everything
    await this.clearNextCache();
    await this.clearNodeModules();
    await this.clearAllCaches();
    
    // Fresh install
    await this.reinstallDependencies();
    
    // Try build one more time
    this.log('INFO', 'Attempting build after emergency recovery');
    const BuildMonitor = require('./build-monitor');
    const monitor = new BuildMonitor();
    
    try {
      await monitor.runBuildWithMonitoring();
      this.log('SUCCESS', 'Emergency recovery successful');
      return true;
    } catch (error) {
      this.log('ERROR', 'Emergency recovery failed - manual intervention required');
      return false;
    }
  }
}

// CLI Interface
if (require.main === module) {
  const recovery = new BuildRecovery();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'detect':
      recovery.detectBuildIssues()
        .then(issues => {
          console.log('🔍 Build Issues:', JSON.stringify(issues, null, 2));
          process.exit(issues.length > 0 ? 1 : 0);
        })
        .catch(error => {
          console.error('❌ Detection failed:', error.message);
          process.exit(1);
        });
      break;
      
    case 'recover':
      recovery.attemptRecovery()
        .then(success => {
          if (success) {
            console.log('✅ Recovery completed successfully');
            process.exit(0);
          } else {
            console.log('❌ Recovery failed');
            process.exit(1);
          }
        })
        .catch(error => {
          console.error('❌ Recovery failed:', error.message);
          process.exit(1);
        });
      break;
      
    case 'emergency':
      recovery.emergencyRecovery()
        .then(success => {
          if (success) {
            console.log('✅ Emergency recovery completed');
            process.exit(0);
          } else {
            console.log('❌ Emergency recovery failed - manual intervention required');
            process.exit(1);
          }
        })
        .catch(error => {
          console.error('❌ Emergency recovery failed:', error.message);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: node build-recovery.js [detect|recover|emergency]');
      console.log('  detect    - Detect build issues');
      console.log('  recover   - Attempt automatic recovery');
      console.log('  emergency - Emergency recovery (nuclear option)');
      process.exit(1);
  }
}

module.exports = BuildRecovery;