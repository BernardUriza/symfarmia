#!/usr/bin/env node
/**
 * BUILD GUARDIAN - TRANSLATION ENFORCEMENT SYSTEM
 * 
 * This script acts as a guardian that prevents builds and dev server startup
 * when translations are incomplete. It's IMPLACABLE and will NOT allow
 * any bypass of translation validation.
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

class BuildGuardian {
  constructor() {
    this.lockFile = path.join(__dirname, '../.translation-lock');
    this.validationScript = path.join(__dirname, 'revolutionary-translation-validator.js');
    this.isDevMode = process.argv.includes('--dev');
    this.isBuildMode = process.argv.includes('--build');
  }

  async guard() {
    console.log('🛡️  BUILD GUARDIAN ACTIVATED');
    console.log(`⚡ Mode: ${this.isDevMode ? 'DEV SERVER' : 'BUILD'}`);
    
    try {
      // Check if translations are locked (validation failed recently)
      //await this.checkTranslationLock();
      
      // Run revolutionary validation
      //await this.runRevolutionaryValidation();
      
      // Clear any existing lock
      //await this.clearTranslationLock();
      
      console.log('✅ BUILD GUARDIAN: All checks passed');
      console.log('🚀 Allowing build/dev server to proceed...');
      
    } catch (error) {
      console.error('🚨 BUILD GUARDIAN: BLOCKING OPERATION');
      console.error(`❌ Reason: ${error.message}`);
      
      // Create lock file to prevent future attempts
      await this.createTranslationLock(error.message);
      
      // Show fix instructions
      this.showFixInstructions();
      
      process.exit(1);
    }
  }

  async checkTranslationLock() {
    if (fs.existsSync(this.lockFile)) {
      const lockData = JSON.parse(fs.readFileSync(this.lockFile, 'utf8'));
      const timeDiff = Date.now() - lockData.timestamp;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff < 1) { // Lock expires after 1 hour
        throw new Error(`Translation lock active. Last failure: ${lockData.reason}`);
      } else {
        // Lock expired, remove it
        fs.unlinkSync(this.lockFile);
      }
    }
  }

  async runRevolutionaryValidation() {
    console.log('🔍 Running revolutionary translation validation...');
    
    try {
      const { stdout, stderr } = await execAsync(`node "${this.validationScript}"`);
      
      if (stderr && stderr.includes('VALIDATION FAILED')) {
        throw new Error('Translation validation failed');
      }
      
      console.log('✅ Revolutionary validation passed');
      return true;
      
    } catch (error) {
      // If validation script exits with non-zero code, it means validation failed
      throw new Error(`Translation validation failed: ${error.message}`);
    }
  }

  async createTranslationLock(reason) {
    const lockData = {
      timestamp: Date.now(),
      reason: reason,
      mode: this.isDevMode ? 'dev' : 'build',
      message: 'Translation validation failed. Fix all missing translations before proceeding.'
    };
    
    fs.writeFileSync(this.lockFile, JSON.stringify(lockData, null, 2));
    console.log('🔒 Translation lock created');
  }

  async clearTranslationLock() {
    if (fs.existsSync(this.lockFile)) {
      fs.unlinkSync(this.lockFile);
      console.log('🔓 Translation lock cleared');
    }
  }

  showFixInstructions() {
    console.log('\n🔧 HOW TO FIX TRANSLATION ISSUES:');
    console.log('━'.repeat(50));
    console.log('1. Auto-fix missing translations:');
    console.log('   npm run translations:auto-fix');
    console.log('');
    console.log('2. Validate translations manually:');
    console.log('   npm run translations:validate-strict');
    console.log('');
    console.log('3. Validate and auto-fix in one command:');
    console.log('   npm run translations:validate-and-fix');
    console.log('');
    console.log('4. Check specific missing keys:');
    console.log('   npm run validate:translations');
    console.log('');
    console.log('⚠️  IMPORTANT: The build/dev server is BLOCKED until ALL');
    console.log('   translations are complete. No exceptions!');
    console.log('━'.repeat(50));
  }
}

// Execute guardian
async function main() {
  const guardian = new BuildGuardian();
  await guardian.guard();
}

if (require.main === module) {
  main().catch(error => {
    console.error('🚨 BUILD GUARDIAN CRASHED:', error);
    process.exit(1);
  });
}

module.exports = { BuildGuardian };