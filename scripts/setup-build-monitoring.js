#!/usr/bin/env node

/**
 * Setup Build Monitoring System
 * Initializes all monitoring components and creates initial configuration
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class BuildMonitoringSetup {
  constructor() {
    this.scriptsDir = __dirname;
    this.logsDir = path.join(__dirname, '../logs');
    this.configDir = path.join(__dirname, '../config');
  }

  log(message) {
    console.log(`🔧 [SETUP] ${message}`);
  }

  async ensureDirectories() {
    this.log('Creating necessary directories');
    
    const dirs = [this.logsDir, this.configDir];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.log(`Created directory: ${dir}`);
      } else {
        this.log(`Directory exists: ${dir}`);
      }
    });
  }

  async createInitialConfigs() {
    this.log('Creating initial configuration files');
    
    // Build alerts configuration
    const alertsConfig = {
      enabled: true,
      alertMethods: ['console', 'file', 'system'],
      thresholds: {
        buildTimeoutMinutes: 10,
        consecutiveFailures: 3,
        hangingMinutes: 5
      },
      notifications: {
        system: true,
        email: false,
        slack: false,
        webhook: false
      }
    };

    const alertsConfigPath = path.join(this.configDir, 'build-alerts.json');
    if (!fs.existsSync(alertsConfigPath)) {
      fs.writeFileSync(alertsConfigPath, JSON.stringify(alertsConfig, null, 2));
      this.log('Created build-alerts.json');
    }

    // CLAUDE.md update instructions
    const claudeInstructions = `

## Build Monitoring System

### Quick Start
- **Monitor build**: \`npm run build\` (now uses monitoring automatically)
- **Check priorities**: \`npm run build:diary:priorities\`
- **View build health**: \`npm run build:health\`
- **Recover from failures**: \`npm run build:recover\`

### Daily Workflow
1. Start each day with: \`npm run build:diary:priorities\`
2. Address P1_CRITICAL issues immediately
3. Check build health before major changes: \`npm run build:health\`
4. If builds fail/hang, use: \`npm run build:recover\`

### Emergency Procedures
- **Build hanging**: \`npm run build:emergency\`
- **Multiple failures**: Check \`npm run build:diary:read\` for patterns
- **System issues**: \`npm run build:detect\` to identify problems

### Monitoring Commands
- \`npm run build:monitor\` - Run build with full monitoring
- \`npm run build:health\` - Check build environment health
- \`npm run build:recover\` - Attempt automatic recovery
- \`npm run build:alerts\` - Start alert monitoring
- \`npm run build:diary\` - Generate daily report
- \`npm run build:diary:priorities\` - Show current priorities

### Log Files
- \`logs/build-diary.log\` - Complete build history
- \`logs/build-alerts.log\` - Alert history
- \`logs/build-recovery.log\` - Recovery attempts
- \`logs/build-diary-report.json\` - Latest daily report

### Alert System
The system monitors for:
- Build timeouts (>10 minutes)
- Hanging builds (no output >5 minutes)
- Consecutive failures (>3)
- Webpack cache issues
- Disk space problems

Alerts are sent via:
- Console notifications
- System notifications (desktop)
- Log files for tracking

### Recovery System
Automatic recovery strategies:
1. Clear Next.js cache
2. Clear node_modules
3. Reinstall dependencies
4. Clear all caches
5. Reset git state

Use \`npm run build:emergency\` for nuclear option recovery.
`;

    const claudeMdPath = path.join(__dirname, '../CLAUDE.md');
    if (fs.existsSync(claudeMdPath)) {
      const currentContent = fs.readFileSync(claudeMdPath, 'utf8');
      if (!currentContent.includes('## Build Monitoring System')) {
        fs.appendFileSync(claudeMdPath, claudeInstructions);
        this.log('Updated CLAUDE.md with monitoring instructions');
      }
    }
  }

  async testSystem() {
    this.log('Testing build monitoring system');
    
    try {
      // Test alerts system
      this.log('Testing alert system...');
      const { spawn } = require('child_process');
      
      const testAlert = spawn('node', [path.join(this.scriptsDir, 'build-alerts.js'), 'test'], {
        stdio: 'inherit'
      });
      
      await new Promise((resolve, reject) => {
        testAlert.on('close', (code) => {
          if (code === 0) {
            this.log('✅ Alert system test passed');
            resolve();
          } else {
            this.log('❌ Alert system test failed');
            reject(new Error('Alert test failed'));
          }
        });
      });

      // Test diary system
      this.log('Testing diary system...');
      const testDiary = spawn('node', [path.join(this.scriptsDir, 'build-diary.js'), 'daily'], {
        stdio: 'inherit'
      });
      
      await new Promise((resolve, reject) => {
        testDiary.on('close', (code) => {
          if (code === 0) {
            this.log('✅ Diary system test passed');
            resolve();
          } else {
            this.log('❌ Diary system test failed');
            reject(new Error('Diary test failed'));
          }
        });
      });

      // Test health check
      this.log('Testing health check...');
      const testHealth = spawn('node', [path.join(this.scriptsDir, 'build-monitor.js'), 'health'], {
        stdio: 'inherit'
      });
      
      await new Promise((resolve, reject) => {
        testHealth.on('close', (code) => {
          if (code === 0) {
            this.log('✅ Health check test passed');
            resolve();
          } else {
            this.log('❌ Health check test failed');
            reject(new Error('Health check test failed'));
          }
        });
      });

    } catch (error) {
      this.log(`❌ System test failed: ${error.message}`);
      throw error;
    }
  }

  async displayInstructions() {
    console.log('\n🎉 BUILD MONITORING SYSTEM SETUP COMPLETE! 🎉');
    console.log('=' .repeat(60));
    console.log('');
    console.log('📋 DAILY WORKFLOW:');
    console.log('');
    console.log('1. Check priorities each morning:');
    console.log('   npm run build:diary:priorities');
    console.log('');
    console.log('2. Build with monitoring (replaces npm run build):');
    console.log('   npm run build');
    console.log('');
    console.log('3. If build fails/hangs:');
    console.log('   npm run build:recover');
    console.log('');
    console.log('4. For emergency recovery:');
    console.log('   npm run build:emergency');
    console.log('');
    console.log('🚨 PRIORITY ALERTS:');
    console.log('');
    console.log('The system will automatically:');
    console.log('• ⏰ Detect builds hanging >5 minutes');
    console.log('• 🚫 Kill builds hanging >10 minutes');
    console.log('• 📊 Log all build events for analysis');
    console.log('• 🔔 Send desktop notifications for critical issues');
    console.log('• 📈 Generate daily priority reports');
    console.log('• 🛠️  Attempt automatic recovery');
    console.log('');
    console.log('📁 LOG LOCATIONS:');
    console.log('• logs/build-diary.log - Complete build history');
    console.log('• logs/build-alerts.log - Alert notifications');
    console.log('• logs/build-recovery.log - Recovery attempts');
    console.log('• logs/build-diary-report.json - Latest daily report');
    console.log('');
    console.log('⚡ QUICK COMMANDS:');
    console.log('• npm run build:diary:priorities - Check current issues');
    console.log('• npm run build:health - Check system health');
    console.log('• npm run build:detect - Identify specific problems');
    console.log('• npm run build:alerts:summary - View recent alerts');
    console.log('');
    console.log('🔧 The system is now active and will monitor all builds!');
    console.log('');
  }

  async setup() {
    try {
      this.log('Starting build monitoring system setup');
      
      await this.ensureDirectories();
      await this.createInitialConfigs();
      await this.testSystem();
      await this.displayInstructions();
      
      this.log('Setup completed successfully!');
      return true;
    } catch (error) {
      this.log(`Setup failed: ${error.message}`);
      return false;
    }
  }
}

// CLI Interface
if (require.main === module) {
  const setup = new BuildMonitoringSetup();
  
  setup.setup()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = BuildMonitoringSetup;