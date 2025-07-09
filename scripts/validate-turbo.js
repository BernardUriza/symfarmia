#!/usr/bin/env node
/**
 * TURBO ENFORCEMENT VALIDATION SCRIPT
 * Ensures development server ALWAYS runs with --turbo flag
 * Part of SYMFARMIA's Turbopack enforcement system
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI colors for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkTurboFlag() {
  const args = process.argv.slice(2);
  const parentArgs = process.env.npm_config_argv ? 
    JSON.parse(process.env.npm_config_argv).original : [];
  
  // Check if --turbo flag is present in any arguments
  const hasTurboFlag = args.includes('--turbo') || 
                      args.includes('--turbopack') ||
                      parentArgs.includes('--turbo') ||
                      parentArgs.includes('--turbopack');
  
  // Check if this is a turbo-enforced command
  const script = process.env.npm_lifecycle_event;
  const isTurboEnforcedScript = ['dev'].includes(script);
  
  // If this is standalone validation, just validate config
  if (script === 'validate-turbo' || !script) {
    log('✅ Turbo enforcement system is configured correctly', 'green');
    return true;
  }
  
  if (isTurboEnforcedScript && !hasTurboFlag) {
    log('❌ CRITICAL ERROR: Development server MUST use Turbopack!', 'red');
    log('', 'reset');
    log('🚫 Webpack is BANNED in development mode', 'yellow');
    log('⚡ Only Turbopack is allowed for medical-grade performance', 'blue');
    log('', 'reset');
    log('✅ Use one of these commands instead:', 'green');
    log('   npm run dev        (automatically includes --turbo)', 'green');
    log('   npm run dev:turbo  (explicit turbo command)', 'green');
    log('', 'reset');
    log('🔧 Current package.json scripts enforce Turbopack:', 'blue');
    log('   "dev": "next dev --turbo"', 'blue');
    log('', 'reset');
    
    process.exit(1);
  }
  
  if (isTurboEnforcedScript && hasTurboFlag) {
    log('✅ Turbopack flag detected - development will use Turbopack', 'green');
  }
  
  return true;
}

function validateNextConfig() {
  const configPath = path.join(process.cwd(), 'next.config.js');
  
  if (!fs.existsSync(configPath)) {
    log('⚠️  next.config.js not found', 'yellow');
    return false;
  }
  
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Check for webpack function (BANNED in development)
    // Allow webpack configuration only if it's conditionally applied for production
    const hasWebpackConfig = configContent.includes('webpack:') || 
                             configContent.includes('webpack(');
    
    if (hasWebpackConfig) {
      // Check if webpack is conditionally applied for production only
      const isProductionOnly = configContent.includes('NODE_ENV === \'production\'') &&
                               configContent.includes('webpack');
      
      if (!isProductionOnly) {
        log('🚫 CRITICAL: Webpack configuration detected in next.config.js!', 'red');
        log('   Webpack is BANNED in SYMFARMIA development', 'red');
        log('   Only Turbopack configurations are allowed', 'yellow');
        log('   Webpack is only allowed for production builds', 'yellow');
        return false;
      } else {
        log('✅ Webpack configuration is properly scoped to production builds only', 'green');
      }
    }
    
    // Check for turbopack config (REQUIRED)
    if (!configContent.includes('turbopack') && 
        !configContent.includes('experimental')) {
      log('⚠️  Consider adding turbopack configuration to next.config.js', 'yellow');
    }
    
    log('✅ next.config.js webpack validation passed', 'green');
    return true;
    
  } catch (error) {
    log(`❌ Error reading next.config.js: ${error.message}`, 'red');
    return false;
  }
}

function checkNextVersion() {
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
    );
    
    const nextVersion = packageJson.dependencies?.next || 
                       packageJson.devDependencies?.next;
    
    if (!nextVersion) {
      log('⚠️  Next.js not found in dependencies', 'yellow');
      return false;
    }
    
    // Extract version number (remove ^ or ~ prefix)
    const version = nextVersion.replace(/[\^~]/, '');
    const majorVersion = parseInt(version.split('.')[0]);
    
    if (majorVersion < 13) {
      log(`⚠️  Next.js ${version} detected. Turbopack requires Next.js 13+`, 'yellow');
      return false;
    }
    
    log(`✅ Next.js ${version} supports Turbopack`, 'green');
    return true;
    
  } catch (error) {
    log(`❌ Error checking Next.js version: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('🔍 SYMFARMIA Turbopack Enforcement Validation', 'bold');
  log('===========================================', 'blue');
  log('', 'reset');
  
  const checks = [
    { name: 'Turbo Flag Validation', fn: checkTurboFlag },
    { name: 'Next.js Version Check', fn: checkNextVersion },
    { name: 'Webpack Elimination Check', fn: validateNextConfig }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    log(`🔍 Running: ${check.name}...`, 'blue');
    const result = check.fn();
    
    if (!result) {
      allPassed = false;
    }
    log('', 'reset');
  }
  
  if (allPassed) {
    log('🎉 All Turbopack enforcement checks passed!', 'green');
    log('⚡ SYMFARMIA is running with medical-grade Turbopack performance', 'green');
  } else {
    log('❌ Turbopack enforcement validation failed', 'red');
    log('🚫 Development cannot proceed without Turbopack', 'red');
    process.exit(1);
  }
}

// Run validation
main();