# 🔥 CODEX CI/CD LOCAL PIPELINE

**BRUTAL automation system for SYMFARMIA medical platform**

## 🚀 Overview

This CI/CD system automatically builds and validates your medical platform after every few commits, ensuring:
- **Zero manual builds** during development
- **Medical route validation** for patient safety
- **Aggressive cache cleaning** to prevent corruption
- **Performance monitoring** and alerts
- **Notification system** for build status

## ⚡ Auto-Trigger Logic

### Automatic Build Triggers:
- **3 commits** in development mode (configurable)
- **1 commit** on main/master branch (production)
- **ANY commit** touching medical AI files (`api/medical*`, `medical*.ts`, `patient*.ts`, `consultation*.ts`)
- **Manual trigger** via npm scripts

### Medical-Critical Files:
Any changes to these patterns trigger immediate builds:
```bash
api/medical-ai/*
api/medical/*
**/medical*.{ts,js,tsx,jsx}
**/patient*.{ts,js,tsx,jsx}
**/consultation*.{ts,js,tsx,jsx}
```

## 🛠️ Pipeline Stages

### Stage 1: 💀 Destructive Cleanup (10s)
```bash
rm -rf .next/ dist/ node_modules/.cache/ .turbo/ coverage/
npm cache clean --force
```

### Stage 2: 📦 Fresh Dependencies (30s)
```bash
npm ci --silent --prefer-offline  # uses package-lock hash cache
npm audit --audit-level=high  # Production only
```

### Stage 3: 🔍 Code Quality (45s)
```bash
npm run lint -- --fix
npm run type-check
npm test -- --coverage --silent  # Skip for medical-critical
```

### Stage 4: 🏗️ Production Build (60s)
```bash
NODE_ENV=production npm run build
# Bundle size validation
# Memory monitoring
```

### Stage 5: 🩺 Medical Route Validation (20s)
```bash
node scripts/validate-medical-routes.js
# Tests critical medical endpoints
```

## 📋 Usage

### Automatic (Recommended)
Just commit your code - the pipeline runs automatically:
```bash
git add .
git commit -m "feat: add medical feature"
# Pipeline automatically triggers after 3 commits
```

### Manual Triggers
```bash
# Regular build
npm run auto-build

# Medical-critical build (faster, no tests)
npm run auto-build:medical

# Production build (full validation)
npm run auto-build:production

# Clean build from scratch
npm run ci:local

# Medical emergency build
npm run ci:medical
```

### Validate Routes Only
```bash
npm run validate:routes
```

### Clean Cache
```bash
npm run cache:clean
```

## ⚙️ Configuration

### Environment Variables (.env.cicd)
```bash
AUTO_BUILD_ENABLED=true          # Enable/disable auto-builds
AUTO_BUILD_THRESHOLD=3           # Commits before auto-build
MEDICAL_CRITICAL_BUILD=true      # Enable medical file detection
MAX_BUILD_TIME=300               # Max build time (seconds)
MAX_MEMORY_MB=2048              # Memory limit (MB)
WEBHOOK_URL=                     # Slack/Discord webhook (optional)
```

### Medical Routes Validated
- `/api/medical-ai/transcription` - AI transcription endpoint
- `/api/medical-ai/consultation` - Medical consultation API
- `/api/medical` - Core medical API
- `/api/patients` - Patient management
- `/dashboard` - Medical dashboard
- `/consultation` - Consultation workspace
- `/` - Landing page

## 🚨 Build Types

### `--regular`
- Full pipeline with tests
- Standard for development
- Triggered after X commits

### `--medical-critical`
- Skips tests for speed
- Triggered by medical file changes
- Includes medical route validation
- Fastest build for emergency fixes

### `--production`
- Full validation + security audit
- Triggered on main/master branch
- Includes performance analysis
- Most thorough build

## 📊 Performance Monitoring

### Automatic Warnings:
- **Build time > 2 minutes**
- **Bundle size > 10MB**
- **Memory usage > 2GB**
- **Route response > 2 seconds**

### Build Reports:
```bash
🎯 BUILD COMPLETED SUCCESSFULLY
⏱️  Duration: 47s
📊 Build size: 234KB
🧠 Memory used: 1.2GB
🏗️  Build type: --regular
```

## 🔔 Notifications

### Success Notification:
```
🔥 SYMFARMIA Auto-Build ✅
📊 Duration: 47s
📦 Bundle: 234KB (↓12KB)
🩺 Medical routes: All validated
🚀 Ready for deployment
```

### Failure Notification:
```
🚨 SYMFARMIA Auto-Build ❌
💀 Failed at: Code Quality Stage
🔍 Error: TypeScript errors in medical-ai.ts
⚡ Fix required before next commit
```

## 🩺 Medical Safety Features

### Critical Route Validation
- Tests all medical endpoints after build
- Validates response times < 5 seconds
- Retries failed critical routes 3 times
- Fails build if critical medical routes are broken

### Medical File Detection
- Immediate builds for medical code changes
- Prioritizes patient safety over development speed
- Special handling for AI and consultation modules

### Healthcare Compliance
- Comprehensive logging for audit trails
- Performance monitoring for medical systems
- Zero-tolerance for broken medical functionality

## 🛠️ Troubleshooting

### Build Fails
```bash
# Check build logs
cat .last_build_timestamp

# Manual clean build
npm run cache:clean && npm run ci:local

# Skip auto-builds temporarily
export AUTO_BUILD_ENABLED=false
```

### Medical Routes Fail
```bash
# Test routes manually
npm run validate:routes

# Check if dev server is running
ps aux | grep "next dev"

# Kill any hanging processes
pkill -f "next"
```

### Performance Issues
```bash
# Check memory usage
free -h

# Check build artifacts size
du -sh .next/

# Clean all caches
npm run cache:clean
```

## 🔧 Advanced Configuration

### Custom Webhook (Slack/Discord)
```bash
export WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK"
```

### Modify Build Threshold
```bash
export AUTO_BUILD_THRESHOLD=5  # Build every 5 commits
```

### Disable Medical Detection
```bash
export MEDICAL_CRITICAL_BUILD=false
```

## 📈 Metrics & Analytics

The system tracks:
- Build frequency and duration
- Success/failure rates
- Medical route performance
- Bundle size trends
- Memory usage patterns

## 🚀 Future Enhancements

- [x] Build caching for faster incremental builds
- [ ] Parallel builds for multiple branches
- [ ] Analytics dashboard
- [ ] Smart test selection
- [ ] Performance regression detection
- [ ] Integration with monitoring tools

## 💀 CODEX Philosophy

> "If it can be automated, automate it brutally.  
> If it's medical, make it bulletproof.  
> If it's manual, make it obsolete."

---

**Built with BRUTAL efficiency by Codex** 🔥💀

For issues or enhancements, commit your changes and let the pipeline handle it. 🚀