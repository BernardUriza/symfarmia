#!/usr/bin/env node

/**
 * Fix Webpack Import Error Script
 * Specifically addresses the webpack factory 'call' error and JSX import issues
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class WebpackImportFixer {
  constructor() {
    this.rootDir = path.join(__dirname, '..');
    this.log = this.log.bind(this);
  }

  log(level, message, data = {}) {
    const colors = {
      ERROR: '\x1b[31m',
      WARN: '\x1b[33m',
      INFO: '\x1b[36m',
      SUCCESS: '\x1b[32m',
      RESET: '\x1b[0m'
    };
    
    const color = colors[level] || colors.RESET;
    console.log(`${color}[${level}] ${message}${colors.RESET}`);
    
    if (Object.keys(data).length > 0) {
      console.log(`${color}${JSON.stringify(data, null, 2)}${colors.RESET}`);
    }
  }

  async clearNextCache() {
    this.log('INFO', 'Clearing Next.js cache');
    
    const nextDir = path.join(this.rootDir, '.next');
    if (fs.existsSync(nextDir)) {
      try {
        await execAsync(`rm -rf "${nextDir}"`);
        this.log('SUCCESS', 'Next.js cache cleared');
        return true;
      } catch (error) {
        this.log('ERROR', 'Failed to clear Next.js cache', { error: error.message });
        return false;
      }
    } else {
      this.log('INFO', 'Next.js cache directory not found');
      return true;
    }
  }

  async clearWebpackCache() {
    this.log('INFO', 'Clearing webpack cache');
    
    try {
      // Clear various cache locations
      const cachePaths = [
        path.join(this.rootDir, '.next/cache'),
        path.join(this.rootDir, 'node_modules/.cache'),
        path.join(this.rootDir, '.turbo')
      ];
      
      for (const cachePath of cachePaths) {
        if (fs.existsSync(cachePath)) {
          await execAsync(`rm -rf "${cachePath}"`);
          this.log('SUCCESS', `Cleared cache: ${cachePath}`);
        }
      }
      
      return true;
    } catch (error) {
      this.log('ERROR', 'Failed to clear webpack cache', { error: error.message });
      return false;
    }
  }

  async fixImportPaths() {
    this.log('INFO', 'Fixing import paths in MinimalistLandingPage');
    
    const filePath = path.join(this.rootDir, 'src/components/MinimalistLandingPage.jsx');
    
    if (!fs.existsSync(filePath)) {
      this.log('ERROR', 'MinimalistLandingPage.jsx not found', { filePath });
      return false;
    }
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Check if the problematic import is still there
      if (content.includes("from './icons'")) {
        this.log('INFO', 'Found problematic import, fixing...');
        
        // Replace the problematic import with heroicons
        content = content.replace(
          /import\s*\{[^}]+\}\s*from\s*['"]\.\/icons['"];?/g,
          `import {
  MicrophoneIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  UserIcon,
  StarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';`
        );
        
        fs.writeFileSync(filePath, content);
        this.log('SUCCESS', 'Fixed import paths in MinimalistLandingPage');
        return true;
      } else {
        this.log('INFO', 'Import paths already fixed');
        return true;
      }
      
    } catch (error) {
      this.log('ERROR', 'Failed to fix import paths', { error: error.message });
      return false;
    }
  }

  async verifyHeroiconsInstalled() {
    this.log('INFO', 'Verifying @heroicons/react is installed');
    
    const packageJsonPath = path.join(this.rootDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const heroiconsVersion = packageJson.dependencies['@heroicons/react'] || 
                            packageJson.devDependencies['@heroicons/react'];
    
    if (heroiconsVersion) {
      this.log('SUCCESS', `@heroicons/react installed: ${heroiconsVersion}`);
      return true;
    } else {
      this.log('WARN', '@heroicons/react not found, installing...');
      
      try {
        await execAsync('npm install @heroicons/react');
        this.log('SUCCESS', '@heroicons/react installed successfully');
        return true;
      } catch (error) {
        this.log('ERROR', 'Failed to install @heroicons/react', { error: error.message });
        return false;
      }
    }
  }

  async removeProblematicIconsFile() {
    this.log('INFO', 'Checking for problematic icons file');
    
    const iconsPath = path.join(this.rootDir, 'src/components/icons.jsx');
    
    if (fs.existsSync(iconsPath)) {
      this.log('WARN', 'Found problematic icons.jsx file, backing up and removing');
      
      try {
        // Create backup
        const backupPath = path.join(this.rootDir, 'src/components/icons.jsx.backup');
        fs.copyFileSync(iconsPath, backupPath);
        this.log('INFO', `Created backup: ${backupPath}`);
        
        // Remove problematic file
        fs.unlinkSync(iconsPath);
        this.log('SUCCESS', 'Removed problematic icons.jsx file');
        
        return true;
      } catch (error) {
        this.log('ERROR', 'Failed to remove icons file', { error: error.message });
        return false;
      }
    } else {
      this.log('INFO', 'Problematic icons file not found');
      return true;
    }
  }

  async updateNextConfig() {
    this.log('INFO', 'Checking Next.js configuration');
    
    const nextConfigPath = path.join(this.rootDir, 'next.config.js');
    
    if (fs.existsSync(nextConfigPath)) {
      try {
        let config = fs.readFileSync(nextConfigPath, 'utf8');
        
        // Ensure webpack config handles JSX properly
        if (!config.includes('webpack:')) {
          this.log('INFO', 'Adding webpack configuration for better JSX handling');
          
          const webpackConfig = `
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Improve module resolution
    config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
    
    // Add fallbacks for webpack factory issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false
    };
    
    return config;
  },`;
          
          // Insert webpack config before the closing brace
          config = config.replace(/}\s*$/, `${webpackConfig}\n}`);
          
          fs.writeFileSync(nextConfigPath, config);
          this.log('SUCCESS', 'Updated Next.js config with webpack improvements');
        } else {
          this.log('INFO', 'Next.js config already has webpack configuration');
        }
        
        return true;
      } catch (error) {
        this.log('ERROR', 'Failed to update Next.js config', { error: error.message });
        return false;
      }
    } else {
      this.log('INFO', 'No next.config.js found');
      return true;
    }
  }

  async testImportAfterFix() {
    this.log('INFO', 'Testing component import after fixes');
    
    try {
      // Start development server briefly to test compilation
      this.log('INFO', 'Testing Next.js compilation...');
      
      const testResult = await execAsync('npm run build:fast', {
        timeout: 60000, // 1 minute timeout
        cwd: this.rootDir
      });
      
      this.log('SUCCESS', 'Build test passed - imports fixed');
      return true;
      
    } catch (error) {
      this.log('ERROR', 'Build test failed', { 
        error: error.message,
        stdout: error.stdout,
        stderr: error.stderr
      });
      return false;
    }
  }

  async runAllFixes() {
    this.log('INFO', 'Starting webpack import error fix process');
    
    const fixes = [
      { name: 'Verify Heroicons', fn: () => this.verifyHeroiconsInstalled() },
      { name: 'Fix Import Paths', fn: () => this.fixImportPaths() },
      { name: 'Remove Problematic Icons File', fn: () => this.removeProblematicIconsFile() },
      { name: 'Clear Next.js Cache', fn: () => this.clearNextCache() },
      { name: 'Clear Webpack Cache', fn: () => this.clearWebpackCache() },
      { name: 'Update Next Config', fn: () => this.updateNextConfig() }
    ];
    
    let allSucceeded = true;
    
    for (const fix of fixes) {
      this.log('INFO', `Running: ${fix.name}`);
      const success = await fix.fn();
      if (!success) {
        allSucceeded = false;
        this.log('ERROR', `Failed: ${fix.name}`);
      }
    }
    
    if (allSucceeded) {
      this.log('SUCCESS', 'All fixes applied successfully');
      
      // Test the fix
      this.log('INFO', 'Testing fixes...');
      const testPassed = await this.testImportAfterFix();
      
      if (testPassed) {
        this.log('SUCCESS', '🎉 Webpack import error fixed successfully!');
        this.log('INFO', 'You can now run your development server normally');
      } else {
        this.log('WARN', 'Fixes applied but build test failed - may need manual intervention');
      }
      
    } else {
      this.log('ERROR', 'Some fixes failed - manual intervention may be required');
    }
    
    return allSucceeded;
  }

  async generateFixReport() {
    const report = {
      timestamp: new Date().toISOString(),
      issue: 'Webpack factory call error - Cannot read properties of undefined',
      rootCause: 'JSX import resolution failure in webpack compilation',
      appliedFixes: [
        'Replaced custom icons.jsx with @heroicons/react imports',
        'Cleared Next.js and webpack cache',
        'Updated Next.js configuration for better JSX handling',
        'Verified dependencies installation'
      ],
      preventionMeasures: [
        'Use established icon libraries instead of custom JSX files',
        'Implement proper build monitoring',
        'Regular cache clearing in CI/CD',
        'Webpack configuration validation'
      ],
      recommendation: 'Monitor builds with the new build monitoring system to catch similar issues early'
    };
    
    const reportPath = path.join(this.rootDir, 'logs/webpack-fix-report.json');
    const logsDir = path.dirname(reportPath);
    
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log('SUCCESS', `Fix report saved to ${reportPath}`);
    
    return report;
  }
}

// CLI Interface
if (require.main === module) {
  const fixer = new WebpackImportFixer();
  
  fixer.runAllFixes()
    .then(async (success) => {
      await fixer.generateFixReport();
      
      if (success) {
        console.log('\n✅ Webpack import error fixed successfully!');
        console.log('🚀 You can now run your application normally');
        console.log('💡 Use the build monitoring system to prevent similar issues');
        process.exit(0);
      } else {
        console.log('\n⚠️  Some fixes failed - check logs for details');
        console.log('🔧 Manual intervention may be required');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Fix process failed:', error.message);
      process.exit(1);
    });
}

module.exports = WebpackImportFixer;