#!/usr/bin/env node

/**
 * Direct Webpack Import Diagnostic Script
 * Reproduces and diagnoses the webpack factory error
 */

const path = require('path');
const fs = require('fs');

class WebpackDiagnostic {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.rootDir = path.join(__dirname, '..');
  }

  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, level, message, data };
    
    if (level === 'ERROR') {
      this.errors.push(entry);
    } else if (level === 'WARN') {
      this.warnings.push(entry);
    }
    
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
      console.log(`${color}Data: ${JSON.stringify(data, null, 2)}${colors.RESET}`);
    }
  }

  testBasicFileExists() {
    this.log('INFO', 'Testing basic file existence');
    
    const iconsPath = path.join(this.rootDir, 'src/components/icons.jsx');
    const landingPagePath = path.join(this.rootDir, 'src/components/MinimalistLandingPage.jsx');
    
    if (fs.existsSync(iconsPath)) {
      this.log('SUCCESS', 'Icons file exists', { path: iconsPath });
    } else {
      this.log('ERROR', 'Icons file not found', { path: iconsPath });
    }
    
    if (fs.existsSync(landingPagePath)) {
      this.log('SUCCESS', 'Landing page file exists', { path: landingPagePath });
    } else {
      this.log('ERROR', 'Landing page file not found', { path: landingPagePath });
    }
  }

  testNodeRequire() {
    this.log('INFO', 'Testing Node.js require');
    
    try {
      // Change to the root directory for relative imports
      process.chdir(this.rootDir);
      
      const icons = require('../src/components/icons.jsx');
      this.log('SUCCESS', 'Icons module loaded successfully via require');
      
      const expectedIcons = [
        'MicrophoneIcon',
        'DocumentTextIcon',
        'ArrowPathIcon',
        'CheckCircleIcon', 
        'UserIcon',
        'StarIcon',
        'HeartIcon'
      ];
      
      expectedIcons.forEach(iconName => {
        if (icons[iconName]) {
          this.log('SUCCESS', `Icon ${iconName} found and is type: ${typeof icons[iconName]}`);
        } else {
          this.log('ERROR', `Icon ${iconName} not found in exports`);
        }
      });
      
    } catch (error) {
      this.log('ERROR', 'Failed to require icons module', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
  }

  testESMImport() {
    this.log('INFO', 'Testing ES module import');
    
    return import('../src/components/icons.jsx')
      .then(icons => {
        this.log('SUCCESS', 'Icons module loaded successfully via import');
        
        const expectedIcons = [
          'MicrophoneIcon',
          'DocumentTextIcon',
          'ArrowPathIcon',
          'CheckCircleIcon',
          'UserIcon',
          'StarIcon',
          'HeartIcon'
        ];
        
        expectedIcons.forEach(iconName => {
          if (icons[iconName]) {
            this.log('SUCCESS', `Icon ${iconName} found via import and is type: ${typeof icons[iconName]}`);
          } else {
            this.log('ERROR', `Icon ${iconName} not found in import`);
          }
        });
        
        return icons;
      })
      .catch(error => {
        this.log('ERROR', 'Failed to import icons module', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        throw error;
      });
  }

  testLandingPageImport() {
    this.log('INFO', 'Testing landing page import');
    
    return import('../src/components/MinimalistLandingPage.jsx')
      .then(module => {
        this.log('SUCCESS', 'Landing page module loaded successfully');
        
        if (module.default) {
          this.log('SUCCESS', `Landing page component type: ${typeof module.default}`);
        } else {
          this.log('ERROR', 'Landing page has no default export');
        }
        
        return module;
      })
      .catch(error => {
        this.log('ERROR', 'Failed to import landing page module', {
          message: error.message,
          stack: error.stack,
          name: error.name,
          cause: error.cause
        });
        
        // Check if this is the specific webpack factory error
        if (error.message.includes("Cannot read properties of undefined (reading 'call')")) {
          this.log('ERROR', 'WEBPACK FACTORY ERROR DETECTED', {
            diagnosis: 'This is the specific error we are debugging',
            errorType: 'Webpack module factory undefined',
            possibleCauses: [
              'Module compilation failed during build',
              'Import path resolution issue in webpack',
              'Circular dependency between modules',
              'Hot module replacement (HMR) issue in development',
              'Webpack chunk loading failure',
              'ES6/ESM compatibility issue',
              'Next.js build configuration problem'
            ],
            recommendedFixes: [
              'Clear .next cache directory',
              'Check for circular imports',
              'Verify import paths are correct',
              'Check webpack configuration',
              'Restart development server',
              'Check for TypeScript/JavaScript module conflicts'
            ]
          });
        }
        
        throw error;
      });
  }

  testReactComponentInstantiation() {
    this.log('INFO', 'Testing React component instantiation');
    
    try {
      const React = require('react');
      
      return import('../src/components/icons.jsx')
        .then(icons => {
          const { MicrophoneIcon } = icons;
          
          // Test creating a React element
          const element = React.createElement(MicrophoneIcon, { className: 'test' });
          
          if (element && element.type === MicrophoneIcon) {
            this.log('SUCCESS', 'React component instantiated successfully');
          } else {
            this.log('ERROR', 'Failed to create React element');
          }
          
          return element;
        });
        
    } catch (error) {
      this.log('ERROR', 'Failed to instantiate React component', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  checkDependencies() {
    this.log('INFO', 'Checking dependencies');
    
    const packageJsonPath = path.join(this.rootDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const criticalDeps = ['react', 'next', '@types/react'];
    
    criticalDeps.forEach(dep => {
      const version = packageJson.dependencies[dep] || packageJson.devDependencies[dep];
      if (version) {
        this.log('SUCCESS', `Dependency ${dep}: ${version}`);
      } else {
        this.log('ERROR', `Missing dependency: ${dep}`);
      }
    });
  }

  checkBuildFiles() {
    this.log('INFO', 'Checking build files');
    
    const nextDir = path.join(this.rootDir, '.next');
    const nodeModulesDir = path.join(this.rootDir, 'node_modules');
    
    if (fs.existsSync(nextDir)) {
      this.log('SUCCESS', '.next directory exists');
      
      // Check for specific cache files that might be corrupted
      const cacheDir = path.join(nextDir, 'cache');
      if (fs.existsSync(cacheDir)) {
        const webpackCache = path.join(cacheDir, 'webpack');
        if (fs.existsSync(webpackCache)) {
          try {
            const files = fs.readdirSync(webpackCache);
            const corruptedFiles = files.filter(file => file.includes('pack_'));
            if (corruptedFiles.length > 0) {
              this.log('WARN', 'Potentially corrupted webpack cache files found', {
                files: corruptedFiles
              });
            }
          } catch (error) {
            this.log('WARN', 'Cannot read webpack cache directory', {
              error: error.message
            });
          }
        }
      }
    } else {
      this.log('WARN', '.next directory not found');
    }
    
    if (fs.existsSync(nodeModulesDir)) {
      this.log('SUCCESS', 'node_modules directory exists');
    } else {
      this.log('ERROR', 'node_modules directory not found');
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        status: this.errors.length === 0 ? 'PASS' : 'FAIL'
      },
      errors: this.errors,
      warnings: this.warnings,
      recommendations: []
    };

    if (this.errors.length > 0) {
      report.recommendations.push('Clear Next.js cache: rm -rf .next');
      report.recommendations.push('Reinstall dependencies: rm -rf node_modules && npm install');
      report.recommendations.push('Check for circular dependencies in imports');
      report.recommendations.push('Restart development server');
    }

    if (this.warnings.length > 0) {
      report.recommendations.push('Review webpack cache for corrupted files');
      report.recommendations.push('Check build configuration');
    }

    return report;
  }

  async runDiagnostics() {
    this.log('INFO', 'Starting webpack import diagnostics');
    
    try {
      this.testBasicFileExists();
      this.checkDependencies();
      this.checkBuildFiles();
      this.testNodeRequire();
      
      await this.testESMImport();
      await this.testLandingPageImport();
      await this.testReactComponentInstantiation();
      
      this.log('SUCCESS', 'All diagnostics completed');
      
    } catch (error) {
      this.log('ERROR', 'Diagnostics failed', {
        message: error.message,
        stack: error.stack
      });
    }
    
    const report = this.generateReport();
    
    this.log('INFO', 'Diagnostic Report', report);
    
    // Save report to file
    const reportPath = path.join(this.rootDir, 'logs/webpack-diagnostic-report.json');
    const logsDir = path.dirname(reportPath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log('SUCCESS', `Report saved to ${reportPath}`);
    
    return report;
  }
}

// CLI Interface
if (require.main === module) {
  const diagnostic = new WebpackDiagnostic();
  
  diagnostic.runDiagnostics()
    .then(report => {
      if (report.summary.status === 'PASS') {
        console.log('\n✅ All diagnostics passed!');
        process.exit(0);
      } else {
        console.log('\n❌ Diagnostics found issues:');
        console.log(`Errors: ${report.summary.totalErrors}`);
        console.log(`Warnings: ${report.summary.totalWarnings}`);
        console.log('\nRecommendations:');
        report.recommendations.forEach(rec => {
          console.log(`• ${rec}`);
        });
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Diagnostic script failed:', error.message);
      process.exit(1);
    });
}

module.exports = WebpackDiagnostic;