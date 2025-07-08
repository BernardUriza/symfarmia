#!/usr/bin/env node

/**
 * Build Diary System
 * Tracks build history, generates reports, and maintains priority tracking
 * Provides insights into build patterns and recurring issues
 */

const fs = require('fs');
const path = require('path');

class BuildDiary {
  constructor() {
    this.buildLogPath = path.join(__dirname, '../logs/build-diary.log');
    this.alertLogPath = path.join(__dirname, '../logs/build-alerts.log');
    this.recoveryLogPath = path.join(__dirname, '../logs/build-recovery.log');
    this.diaryReportPath = path.join(__dirname, '../logs/build-diary-report.json');
    
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.buildLogPath);
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
    fs.appendFileSync(this.buildLogPath, logLine);
    
    const colors = {
      ERROR: '\x1b[31m',
      WARN: '\x1b[33m',
      INFO: '\x1b[36m',
      SUCCESS: '\x1b[32m',
      RESET: '\x1b[0m'
    };
    
    const color = colors[level.toUpperCase()] || colors.RESET;
    console.log(`${color}[DIARY] ${message}${colors.RESET}`);
  }

  readLogFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(entry => entry);
  }

  async generateDailyReport() {
    this.log('INFO', 'Generating daily build report');
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Read all log files
    const buildLogs = this.readLogFile(this.buildLogPath);
    const alertLogs = this.readLogFile(this.alertLogPath);
    const recoveryLogs = this.readLogFile(this.recoveryLogPath);
    
    // Filter for last 24 hours
    const cutoffTime = now.getTime() - 24 * 60 * 60 * 1000;
    const recentBuilds = buildLogs.filter(entry => 
      new Date(entry.timestamp).getTime() > cutoffTime
    );
    const recentAlerts = alertLogs.filter(entry => 
      new Date(entry.timestamp).getTime() > cutoffTime
    );
    const recentRecoveries = recoveryLogs.filter(entry => 
      new Date(entry.timestamp).getTime() > cutoffTime
    );

    // Analyze build patterns
    const buildAnalysis = this.analyzeBuildPatterns(recentBuilds);
    const alertAnalysis = this.analyzeAlerts(recentAlerts);
    const recoveryAnalysis = this.analyzeRecoveries(recentRecoveries);

    const report = {
      date: today,
      period: 'last_24_hours',
      summary: {
        totalBuilds: buildAnalysis.totalBuilds,
        successfulBuilds: buildAnalysis.successfulBuilds,
        failedBuilds: buildAnalysis.failedBuilds,
        averageBuildTime: buildAnalysis.averageBuildTime,
        totalAlerts: recentAlerts.length,
        criticalAlerts: alertAnalysis.criticalAlerts,
        recoveriesAttempted: recentRecoveries.length,
        recoveriesSuccessful: recoveryAnalysis.successfulRecoveries
      },
      buildDetails: buildAnalysis,
      alertDetails: alertAnalysis,
      recoveryDetails: recoveryAnalysis,
      priorities: this.identifyPriorities(buildAnalysis, alertAnalysis, recoveryAnalysis),
      recommendations: this.generateRecommendations(buildAnalysis, alertAnalysis, recoveryAnalysis),
      timestamp: now.toISOString()
    };

    // Save report
    fs.writeFileSync(this.diaryReportPath, JSON.stringify(report, null, 2));
    
    this.log('SUCCESS', 'Daily report generated', { 
      reportPath: this.diaryReportPath,
      buildCount: report.summary.totalBuilds,
      issues: report.priorities.length
    });

    return report;
  }

  analyzeBuildPatterns(builds) {
    const startedBuilds = builds.filter(b => b.message.includes('Build started'));
    const completedBuilds = builds.filter(b => b.message.includes('Build completed'));
    const failedBuilds = builds.filter(b => b.message.includes('Build failed'));
    const timeoutBuilds = builds.filter(b => b.message.includes('Build timeout'));

    const buildTimes = completedBuilds
      .filter(b => b.data && b.data.duration)
      .map(b => b.data.duration);

    const averageBuildTime = buildTimes.length > 0 
      ? buildTimes.reduce((a, b) => a + b, 0) / buildTimes.length 
      : 0;

    return {
      totalBuilds: startedBuilds.length,
      successfulBuilds: completedBuilds.length,
      failedBuilds: failedBuilds.length,
      timeoutBuilds: timeoutBuilds.length,
      averageBuildTime: Math.round(averageBuildTime),
      longestBuildTime: Math.max(...buildTimes, 0),
      shortestBuildTime: Math.min(...buildTimes, 0),
      buildTimes,
      commonErrors: this.extractCommonErrors(failedBuilds)
    };
  }

  analyzeAlerts(alerts) {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    const alertTypes = {};
    
    alerts.forEach(alert => {
      if (!alertTypes[alert.type]) {
        alertTypes[alert.type] = 0;
      }
      alertTypes[alert.type]++;
    });

    return {
      totalAlerts: alerts.length,
      criticalAlerts: criticalAlerts.length,
      alertTypes,
      mostCommonAlert: Object.keys(alertTypes).reduce((a, b) => 
        alertTypes[a] > alertTypes[b] ? a : b, null
      ),
      urgentAlerts: alerts.filter(a => a.severity === 'critical' || a.severity === 'high')
    };
  }

  analyzeRecoveries(recoveries) {
    const successfulRecoveries = recoveries.filter(r => 
      r.level === 'SUCCESS' && r.message.includes('Recovery')
    );
    const failedRecoveries = recoveries.filter(r => 
      r.level === 'ERROR' && r.message.includes('Recovery')
    );

    return {
      totalRecoveries: recoveries.length,
      successfulRecoveries: successfulRecoveries.length,
      failedRecoveries: failedRecoveries.length,
      recoveryStrategies: this.extractRecoveryStrategies(recoveries)
    };
  }

  extractCommonErrors(failedBuilds) {
    const errors = {};
    
    failedBuilds.forEach(build => {
      if (build.data && build.data.stderr) {
        const error = build.data.stderr.substring(0, 100);
        if (!errors[error]) {
          errors[error] = 0;
        }
        errors[error]++;
      }
    });

    return Object.entries(errors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([error, count]) => ({ error, count }));
  }

  extractRecoveryStrategies(recoveries) {
    const strategies = {};
    
    recoveries.forEach(recovery => {
      if (recovery.message.includes('strategy')) {
        const strategy = recovery.message.match(/strategy:\s*(\w+)/);
        if (strategy) {
          const strategyName = strategy[1];
          if (!strategies[strategyName]) {
            strategies[strategyName] = { attempts: 0, successes: 0 };
          }
          strategies[strategyName].attempts++;
          if (recovery.level === 'SUCCESS') {
            strategies[strategyName].successes++;
          }
        }
      }
    });

    return strategies;
  }

  identifyPriorities(buildAnalysis, alertAnalysis, recoveryAnalysis) {
    const priorities = [];

    // Priority 1: Critical alerts
    if (alertAnalysis.criticalAlerts > 0) {
      priorities.push({
        level: 'P1_CRITICAL',
        title: 'Critical Build Alerts',
        description: `${alertAnalysis.criticalAlerts} critical alerts detected`,
        action: 'Investigate immediately',
        urgency: 'immediate'
      });
    }

    // Priority 1: High failure rate
    if (buildAnalysis.totalBuilds > 0 && 
        (buildAnalysis.failedBuilds / buildAnalysis.totalBuilds) > 0.5) {
      priorities.push({
        level: 'P1_CRITICAL',
        title: 'High Build Failure Rate',
        description: `${Math.round((buildAnalysis.failedBuilds / buildAnalysis.totalBuilds) * 100)}% failure rate`,
        action: 'Review build process and dependencies',
        urgency: 'immediate'
      });
    }

    // Priority 2: Timeout issues
    if (buildAnalysis.timeoutBuilds > 0) {
      priorities.push({
        level: 'P2_HIGH',
        title: 'Build Timeouts',
        description: `${buildAnalysis.timeoutBuilds} builds timed out`,
        action: 'Optimize build performance',
        urgency: 'high'
      });
    }

    // Priority 3: Recovery failures
    if (recoveryAnalysis.failedRecoveries > recoveryAnalysis.successfulRecoveries) {
      priorities.push({
        level: 'P3_MEDIUM',
        title: 'Recovery System Issues',
        description: 'Recovery system not functioning optimally',
        action: 'Review recovery strategies',
        urgency: 'medium'
      });
    }

    return priorities.sort((a, b) => a.level.localeCompare(b.level));
  }

  generateRecommendations(buildAnalysis, alertAnalysis, recoveryAnalysis) {
    const recommendations = [];

    // Build performance recommendations
    if (buildAnalysis.averageBuildTime > 300000) { // 5 minutes
      recommendations.push({
        type: 'performance',
        title: 'Optimize Build Performance',
        description: `Average build time is ${Math.round(buildAnalysis.averageBuildTime / 1000)}s`,
        actions: [
          'Enable webpack build cache',
          'Optimize bundle size',
          'Use parallel builds',
          'Review dependency tree'
        ]
      });
    }

    // Error pattern recommendations
    if (buildAnalysis.commonErrors.length > 0) {
      recommendations.push({
        type: 'stability',
        title: 'Address Common Build Errors',
        description: 'Recurring errors detected in builds',
        actions: [
          'Fix TypeScript configuration issues',
          'Resolve import path problems',
          'Update outdated dependencies',
          'Clear and rebuild caches'
        ]
      });
    }

    // Alert system recommendations
    if (alertAnalysis.totalAlerts > 10) {
      recommendations.push({
        type: 'monitoring',
        title: 'Review Alert Thresholds',
        description: 'High number of alerts may indicate threshold issues',
        actions: [
          'Adjust alert sensitivity',
          'Review alert configuration',
          'Add alert suppression rules',
          'Improve error handling'
        ]
      });
    }

    return recommendations;
  }

  async generateWeeklyReport() {
    this.log('INFO', 'Generating weekly build report');
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Read all log files
    const buildLogs = this.readLogFile(this.buildLogPath);
    const alertLogs = this.readLogFile(this.alertLogPath);
    const recoveryLogs = this.readLogFile(this.recoveryLogPath);
    
    // Filter for last week
    const weeklyBuilds = buildLogs.filter(entry => 
      new Date(entry.timestamp).getTime() > weekAgo.getTime()
    );
    
    // Group by day
    const dailyStats = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayBuilds = weeklyBuilds.filter(entry => 
        entry.timestamp.startsWith(dateStr)
      );
      
      dailyStats[dateStr] = {
        builds: dayBuilds.length,
        successes: dayBuilds.filter(b => b.message.includes('completed successfully')).length,
        failures: dayBuilds.filter(b => b.message.includes('failed')).length
      };
    }

    const weeklyReport = {
      period: 'last_7_days',
      startDate: weekAgo.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
      dailyStats,
      trends: this.analyzeTrends(dailyStats),
      timestamp: now.toISOString()
    };

    this.log('SUCCESS', 'Weekly report generated', weeklyReport);
    return weeklyReport;
  }

  analyzeTrends(dailyStats) {
    const dates = Object.keys(dailyStats).sort();
    const buildCounts = dates.map(date => dailyStats[date].builds);
    const failureCounts = dates.map(date => dailyStats[date].failures);
    
    return {
      buildTrend: this.calculateTrend(buildCounts),
      failureTrend: this.calculateTrend(failureCounts),
      averageBuildsPerDay: buildCounts.reduce((a, b) => a + b, 0) / buildCounts.length,
      averageFailuresPerDay: failureCounts.reduce((a, b) => a + b, 0) / failureCounts.length
    };
  }

  calculateTrend(values) {
    if (values.length < 2) return 'stable';
    
    const first = values[0];
    const last = values[values.length - 1];
    const change = ((last - first) / first) * 100;
    
    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }

  async readDiary() {
    this.log('INFO', 'Reading build diary');
    
    if (!fs.existsSync(this.diaryReportPath)) {
      this.log('WARN', 'No diary report found, generating new one');
      return await this.generateDailyReport();
    }

    const report = JSON.parse(fs.readFileSync(this.diaryReportPath, 'utf8'));
    
    // Check if report is current (less than 24 hours old)
    const reportAge = Date.now() - new Date(report.timestamp).getTime();
    if (reportAge > 24 * 60 * 60 * 1000) {
      this.log('INFO', 'Diary report is outdated, generating new one');
      return await this.generateDailyReport();
    }

    return report;
  }

  async displayPriorities() {
    const report = await this.readDiary();
    
    console.log('\n🚨 BUILD SYSTEM PRIORITIES 🚨');
    console.log('=' .repeat(50));
    
    if (report.priorities.length === 0) {
      console.log('✅ No critical issues detected');
      return;
    }

    report.priorities.forEach((priority, index) => {
      const urgencyColors = {
        immediate: '\x1b[31m',  // Red
        high: '\x1b[33m',       // Yellow
        medium: '\x1b[36m',     // Cyan
        low: '\x1b[32m'         // Green
      };
      
      const color = urgencyColors[priority.urgency] || '\x1b[0m';
      console.log(`${color}${index + 1}. [${priority.level}] ${priority.title}\x1b[0m`);
      console.log(`   ${priority.description}`);
      console.log(`   Action: ${priority.action}\n`);
    });

    console.log('\n📊 RECOMMENDATIONS');
    console.log('=' .repeat(50));
    
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.title}`);
      console.log(`   ${rec.description}`);
      rec.actions.forEach(action => {
        console.log(`   • ${action}`);
      });
      console.log('');
    });
  }
}

// CLI Interface
if (require.main === module) {
  const diary = new BuildDiary();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'daily':
      diary.generateDailyReport()
        .then(report => {
          console.log('📊 Daily Report Generated');
          console.log(`Builds: ${report.summary.totalBuilds} (${report.summary.successfulBuilds} successful, ${report.summary.failedBuilds} failed)`);
          console.log(`Alerts: ${report.summary.totalAlerts} (${report.summary.criticalAlerts} critical)`);
          console.log(`Priorities: ${report.priorities.length} issues require attention`);
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Report generation failed:', error.message);
          process.exit(1);
        });
      break;
      
    case 'weekly':
      diary.generateWeeklyReport()
        .then(report => {
          console.log('📊 Weekly Report:', JSON.stringify(report, null, 2));
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Weekly report failed:', error.message);
          process.exit(1);
        });
      break;
      
    case 'priorities':
      diary.displayPriorities()
        .then(() => {
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Priorities display failed:', error.message);
          process.exit(1);
        });
      break;
      
    case 'read':
      diary.readDiary()
        .then(report => {
          console.log('📖 Build Diary:', JSON.stringify(report, null, 2));
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Diary read failed:', error.message);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: node build-diary.js [daily|weekly|priorities|read]');
      console.log('  daily      - Generate daily build report');
      console.log('  weekly     - Generate weekly build report');
      console.log('  priorities - Display current priorities');
      console.log('  read       - Read current diary');
      process.exit(1);
  }
}

module.exports = BuildDiary;