#!/usr/bin/env node

/**
 * Build Alerts System
 * Sends notifications when builds fail, hang, or have issues
 * Integrates with build monitor to provide real-time alerts
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class BuildAlerts {
  constructor() {
    this.alertLogPath = path.join(__dirname, '../logs/build-alerts.log');
    this.buildLogPath = path.join(__dirname, '../logs/build-diary.log');
    this.alertsConfigPath = path.join(__dirname, '../config/build-alerts.json');
    
    this.ensureLogDirectory();
    this.loadAlertsConfig();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.alertLogPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  loadAlertsConfig() {
    const defaultConfig = {
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

    if (fs.existsSync(this.alertsConfigPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(this.alertsConfigPath, 'utf8'));
        this.config = { ...defaultConfig, ...config };
      } catch (error) {
        this.log('WARN', 'Failed to load alerts config, using defaults');
        this.config = defaultConfig;
      }
    } else {
      this.config = defaultConfig;
      this.saveAlertsConfig();
    }
  }

  saveAlertsConfig() {
    const configDir = path.dirname(this.alertsConfigPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(this.alertsConfigPath, JSON.stringify(this.config, null, 2));
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
    fs.appendFileSync(this.alertLogPath, logLine);
    
    const colors = {
      ERROR: '\x1b[31m',
      WARN: '\x1b[33m',
      INFO: '\x1b[36m',
      SUCCESS: '\x1b[32m',
      RESET: '\x1b[0m'
    };
    
    const color = colors[level.toUpperCase()] || colors.RESET;
    console.log(`${color}[ALERT] ${message}${colors.RESET}`);
  }

  async sendSystemNotification(title, message, urgency = 'normal') {
    if (!this.config.notifications.system) return;

    try {
      // Try to send desktop notification
      await execAsync(`notify-send --urgency=${urgency} "${title}" "${message}"`);
      this.log('INFO', 'System notification sent', { title, message, urgency });
    } catch (error) {
      // Fallback to terminal bell and message
      process.stdout.write('\u0007'); // Bell character
      this.log('INFO', 'System notification fallback', { title, message });
    }
  }

  async sendAlert(alertType, title, message, data = {}) {
    if (!this.config.enabled) return;

    this.log('ERROR', `ALERT: ${title}`, { alertType, message, data });

    const alertData = {
      timestamp: new Date().toISOString(),
      type: alertType,
      title,
      message,
      data,
      severity: this.getAlertSeverity(alertType)
    };

    // Send system notification
    await this.sendSystemNotification(
      `🚨 SYMFARMIA BUILD ALERT`,
      `${title}: ${message}`,
      alertData.severity === 'critical' ? 'critical' : 'normal'
    );

    // Log to alerts file
    const alertLine = JSON.stringify(alertData) + '\n';
    fs.appendFileSync(this.alertLogPath, alertLine);

    // Send to other configured channels
    if (this.config.notifications.email) {
      await this.sendEmailAlert(alertData);
    }

    if (this.config.notifications.slack) {
      await this.sendSlackAlert(alertData);
    }

    if (this.config.notifications.webhook) {
      await this.sendWebhookAlert(alertData);
    }

    return alertData;
  }

  getAlertSeverity(alertType) {
    const severityMap = {
      'build_timeout': 'critical',
      'build_hanging': 'high',
      'build_failure': 'medium',
      'consecutive_failures': 'critical',
      'disk_space_low': 'high',
      'dependency_issue': 'medium',
      'cache_corruption': 'medium'
    };

    return severityMap[alertType] || 'low';
  }

  async sendEmailAlert(alertData) {
    // Placeholder for email integration
    this.log('INFO', 'Email alert would be sent', alertData);
  }

  async sendSlackAlert(alertData) {
    // Placeholder for Slack integration
    this.log('INFO', 'Slack alert would be sent', alertData);
  }

  async sendWebhookAlert(alertData) {
    // Placeholder for webhook integration
    this.log('INFO', 'Webhook alert would be sent', alertData);
  }

  async monitorBuildLogs() {
    if (!fs.existsSync(this.buildLogPath)) {
      this.log('WARN', 'Build log file not found, starting monitoring');
      return;
    }

    this.log('INFO', 'Starting build log monitoring');

    // Watch for changes in build log
    fs.watchFile(this.buildLogPath, async (curr, prev) => {
      if (curr.mtime > prev.mtime) {
        await this.analyzeBuildLogs();
      }
    });

    // Initial analysis
    await this.analyzeBuildLogs();
  }

  async analyzeBuildLogs() {
    const logContent = fs.readFileSync(this.buildLogPath, 'utf8');
    const lines = logContent.split('\n').filter(line => line.trim());
    
    const recentEntries = lines.slice(-100).map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(entry => entry);

    // Check for timeouts
    const timeouts = recentEntries.filter(entry => 
      entry.level === 'ERROR' && entry.message.includes('timeout')
    );

    if (timeouts.length > 0) {
      await this.sendAlert(
        'build_timeout',
        'Build Timeout Detected',
        `${timeouts.length} build timeout(s) detected`,
        { timeouts: timeouts.slice(-3) }
      );
    }

    // Check for hanging builds
    const hangingBuilds = recentEntries.filter(entry => 
      entry.level === 'WARN' && entry.message.includes('hanging')
    );

    if (hangingBuilds.length > 0) {
      await this.sendAlert(
        'build_hanging',
        'Build Hanging Detected',
        `Build appears to be hanging with no output`,
        { hangingBuilds: hangingBuilds.slice(-1) }
      );
    }

    // Check for consecutive failures
    const recentFailures = recentEntries.filter(entry => 
      entry.level === 'ERROR' && entry.message.includes('Build failed')
    );

    if (recentFailures.length >= this.config.thresholds.consecutiveFailures) {
      await this.sendAlert(
        'consecutive_failures',
        'Multiple Build Failures',
        `${recentFailures.length} consecutive build failures detected`,
        { failures: recentFailures.slice(-3) }
      );
    }

    // Check for webpack cache issues
    const cacheIssues = recentEntries.filter(entry => 
      entry.message.includes('webpack.cache') || 
      entry.message.includes('PackFileCacheStrategy')
    );

    if (cacheIssues.length > 0) {
      await this.sendAlert(
        'cache_corruption',
        'Webpack Cache Issues',
        `Webpack cache corruption detected`,
        { cacheIssues: cacheIssues.slice(-1) }
      );
    }
  }

  async generateAlertSummary() {
    if (!fs.existsSync(this.alertLogPath)) {
      return { totalAlerts: 0, criticalAlerts: 0, recentAlerts: [] };
    }

    const logContent = fs.readFileSync(this.alertLogPath, 'utf8');
    const lines = logContent.split('\n').filter(line => line.trim());
    
    const alerts = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(alert => alert);

    const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
    const recentAlerts = alerts.filter(alert => 
      new Date(alert.timestamp).getTime() > last24Hours
    );

    const criticalAlerts = recentAlerts.filter(alert => 
      alert.severity === 'critical'
    );

    return {
      totalAlerts: alerts.length,
      recentAlerts: recentAlerts.length,
      criticalAlerts: criticalAlerts.length,
      alertTypes: this.groupAlertsByType(recentAlerts),
      lastAlert: alerts.length > 0 ? alerts[alerts.length - 1] : null
    };
  }

  groupAlertsByType(alerts) {
    const grouped = {};
    alerts.forEach(alert => {
      if (!grouped[alert.type]) {
        grouped[alert.type] = 0;
      }
      grouped[alert.type]++;
    });
    return grouped;
  }

  async testAlert() {
    this.log('INFO', 'Sending test alert');
    
    await this.sendAlert(
      'test_alert',
      'Test Alert',
      'This is a test alert to verify the system is working',
      { test: true, timestamp: new Date().toISOString() }
    );
  }
}

// CLI Interface
if (require.main === module) {
  const alerts = new BuildAlerts();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'monitor':
      alerts.monitorBuildLogs()
        .then(() => {
          console.log('📊 Build log monitoring started');
          // Keep running
        })
        .catch(error => {
          console.error('❌ Monitoring failed:', error.message);
          process.exit(1);
        });
      break;
      
    case 'test':
      alerts.testAlert()
        .then(() => {
          console.log('✅ Test alert sent');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Test alert failed:', error.message);
          process.exit(1);
        });
      break;
      
    case 'summary':
      alerts.generateAlertSummary()
        .then(summary => {
          console.log('📊 Alert Summary:', JSON.stringify(summary, null, 2));
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Summary generation failed:', error.message);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: node build-alerts.js [monitor|test|summary]');
      console.log('  monitor - Start monitoring build logs for alerts');
      console.log('  test    - Send a test alert');
      console.log('  summary - Generate alert summary');
      process.exit(1);
  }
}

module.exports = BuildAlerts;