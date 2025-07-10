#!/usr/bin/env node
/**
 * BUILD GUARDIAN - TRANSLATION EXECUTIONER
 * 
 * This guardian does NOT negotiate with incomplete translations.
 * If one key falta, TODO truena. Build/server bloqueado.
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
      await this.checkTranslationLock();
      await this.runRevolutionaryValidation();
      await this.clearTranslationLock();
      console.log('✅ BUILD GUARDIAN: All checks passed');
      console.log('🚀 Allowing build/dev server to proceed...');
    } catch (error) {
      console.error('🚨 BUILD GUARDIAN: BLOCKING OPERATION');
      // Print full error details, not just the message
      if (error.stdout || error.stderr) {
        if (error.stdout) {
          console.error('--- STDOUT ---\n' + error.stdout);
        }
        if (error.stderr) {
          console.error('--- STDERR ---\n' + error.stderr);
        }
      }
      console.error(`❌ Reason: ${error.message}`);
      await this.createTranslationLock(error.message);
      this.showFixInstructions();
      process.exit(1);
    }
  }

  async checkTranslationLock() {
    if (fs.existsSync(this.lockFile)) {
      const lockData = JSON.parse(fs.readFileSync(this.lockFile, 'utf8'));
      const timeDiff = Date.now() - lockData.timestamp;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      if (hoursDiff < 1) {
        throw new Error(`Translation lock active. Last failure: ${lockData.reason}`);
      } else {
        fs.unlinkSync(this.lockFile);
      }
    }
  }

  async runRevolutionaryValidation() {
    console.log('🔍 Running revolutionary translation validation...');
    // NOTA: Utiliza exec (callback), no execAsync, para máxima compatibilidad con output largo.
    return new Promise((resolve, reject) => {
      exec(`node "${this.validationScript}"`, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (stdout) process.stdout.write(stdout);
        if (stderr) process.stderr.write(stderr);

        if (error) {
          // Attach output to error object for brutal reporting
          error.stdout = stdout;
          error.stderr = stderr;
          return reject(error);
        }
        console.log('✅ Revolutionary validation passed');
        resolve(true);
      });
    });
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
    console.log('   npm run translations:auto-fix\n');
    console.log('2. Validate translations manually:');
    console.log('   npm run translations:validate-strict\n');
    console.log('3. Validate and auto-fix in one command:');
    console.log('   npm run translations:validate-and-fix\n');
    console.log('4. Check specific missing keys:');
    console.log('   npm run validate:translations\n');
    console.log('⚠️  IMPORTANT: The build/dev server is BLOCKED until ALL');
    console.log('   translations are complete. No exceptions!');
    console.log('━'.repeat(50));
  }
}

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
