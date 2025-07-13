#!/usr/bin/env node
/**
 * BUILD GUARDIAN - TRANSLATION & TURBO EXECUTIONER
 * 
 * This guardian does NOT negotiate with incomplete translations OR missing Turbo.
 * If one key falta OR turbo missing, TODO truena. Build/server bloqueado.
 * 
 * IMPORTANT BUILD SYSTEM DISTINCTION:
 * - TURBO (Turbopack): MANDATORY for DEV mode ONLY
 * - WEBPACK: MANDATORY for PROD/BUILD mode ONLY
 * 
 * This is the SYMFARMIA way: different bundlers for different environments.
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const { MicroserviceE2EGuardian } = require('./microservice-e2e-guardian');

const execAsync = promisify(exec);

class BuildGuardian {
  constructor() {
    this.lockFile = path.join(__dirname, '../.translation-lock');
    this.turboLockFile = path.join(__dirname, '../.turbo-lock');
    this.microserviceLockFile = path.join(__dirname, '../.microservice-lock');
    this.validationScript = path.join(__dirname, 'revolutionary-translation-validator.js');
    this.turboValidationScript = path.join(__dirname, 'validate-turbo.js');
    this.isDevMode = process.argv.includes('--dev');
    this.isBuildMode = process.argv.includes('--build');
    this.microserviceGuardian = new MicroserviceE2EGuardian();
  }

  async guard() {
    console.log('🛡️  BUILD GUARDIAN ACTIVATED');
    console.log(`⚡ Mode: ${this.isDevMode ? 'DEV SERVER' : 'BUILD'}`);
    try {
      // Check locks first
      await this.checkTranslationLock();
      await this.checkTurboLock();
      await this.checkMicroserviceLock();
      
      // Run validations
      if (this.isDevMode) {
        // TURBO validation ONLY for DEV mode (Turbopack=DEV, Webpack=PROD)
        await this.runTurboValidation();
      }
      await this.runRevolutionaryValidation();
      
      // Run microservice E2E tests
      await this.runMicroserviceE2E();
      
      // Clear locks
      await this.clearTranslationLock();
      await this.clearTurboLock();
      await this.clearMicroserviceLock();
      
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
      
      // Create appropriate lock based on error type
      if (error.type === 'turbo') {
        await this.createTurboLock(error.message);
      } else if (error.type === 'microservice') {
        await this.createMicroserviceLock(error.message);
      } else {
        await this.createTranslationLock(error.message);
      }
      
      this.showFixInstructions(error.type);
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

  async checkTurboLock() {
    if (fs.existsSync(this.turboLockFile)) {
      const lockData = JSON.parse(fs.readFileSync(this.turboLockFile, 'utf8'));
      const timeDiff = Date.now() - lockData.timestamp;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      if (hoursDiff < 1) {
        const error = new Error(`Turbo lock active. Last failure: ${lockData.reason}`);
        error.type = 'turbo';
        throw error;
      } else {
        fs.unlinkSync(this.turboLockFile);
      }
    }
  }

  async runTurboValidation() {
    console.log('⚡ Running Turbopack validation...');
    return new Promise((resolve, reject) => {
      const env = {
        ...process.env,
        npm_lifecycle_event: 'dev-internal' // Set a special context for guardian validation
      };
      
      exec(`node "${this.turboValidationScript}"`, { maxBuffer: 1024 * 1024 * 10, env }, (error, stdout, stderr) => {
        if (stdout) process.stdout.write(stdout);
        if (stderr) process.stderr.write(stderr);

        if (error) {
          // Attach output to error object for brutal reporting
          error.stdout = stdout;
          error.stderr = stderr;
          error.type = 'turbo';
          return reject(error);
        }
        console.log('✅ Turbopack validation passed');
        resolve(true);
      });
    });
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
          error.type = 'translation';
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

  async createTurboLock(reason) {
    const lockData = {
      timestamp: Date.now(),
      reason: reason,
      mode: this.isDevMode ? 'dev' : 'build',
      message: 'Turbopack validation failed. Development server MUST use --turbo flag.'
    };
    fs.writeFileSync(this.turboLockFile, JSON.stringify(lockData, null, 2));
    console.log('🔒 Turbo lock created');
  }

  async clearTranslationLock() {
    if (fs.existsSync(this.lockFile)) {
      fs.unlinkSync(this.lockFile);
      console.log('🔓 Translation lock cleared');
    }
  }

  async clearTurboLock() {
    if (fs.existsSync(this.turboLockFile)) {
      fs.unlinkSync(this.turboLockFile);
      console.log('🔓 Turbo lock cleared');
    }
  }

  async checkMicroserviceLock() {
    if (fs.existsSync(this.microserviceLockFile)) {
      const lockData = JSON.parse(fs.readFileSync(this.microserviceLockFile, 'utf8'));
      const timeDiff = Date.now() - lockData.timestamp;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      if (hoursDiff < 1) {
        const error = new Error(`Microservice lock active. Last failure: ${lockData.reason}`);
        error.type = 'microservice';
        throw error;
      } else {
        fs.unlinkSync(this.microserviceLockFile);
      }
    }
  }

  async runMicroserviceE2E() {
    console.log('🔬 Running microservice E2E tests...');
    console.log('   Including file path fix validation tests...');
    try {
      const result = await this.microserviceGuardian.guard();
      if (!result) {
        const error = new Error('Microservice E2E tests failed - File path or transcription issue');
        error.type = 'microservice';
        throw error;
      }
      console.log('✅ Microservice E2E tests passed');
      console.log('✅ File path fix validated - uploads directory working correctly');
      return true;
    } catch (error) {
      error.type = 'microservice';
      throw error;
    }
  }

  async createMicroserviceLock(reason) {
    const lockData = {
      timestamp: Date.now(),
      reason: reason,
      mode: this.isDevMode ? 'dev' : 'build',
      message: 'Microservice E2E validation failed. Whisper transcription service must be working correctly.'
    };
    fs.writeFileSync(this.microserviceLockFile, JSON.stringify(lockData, null, 2));
    console.log('🔒 Microservice lock created');
  }

  async clearMicroserviceLock() {
    if (fs.existsSync(this.microserviceLockFile)) {
      fs.unlinkSync(this.microserviceLockFile);
      console.log('🔓 Microservice lock cleared');
    }
  }

  showFixInstructions(errorType = 'translation') {
    if (errorType === 'microservice') {
      console.log('\n🔧 HOW TO FIX MICROSERVICE ISSUES:');
      console.log('━'.repeat(50));
      console.log('1. Install microservice dependencies:');
      console.log('   cd microservices/susurro-test && npm install\n');
      console.log('2. Download Whisper model:');
      console.log('   cd microservices/susurro-test && npm run download-model\n');
      console.log('3. Check uploads directory (FILE PATH FIX):');
      console.log('   mkdir -p microservices/susurro-test/uploads');
      console.log('   ls -la microservices/susurro-test/uploads/\n');
      console.log('4. Test microservice manually:');
      console.log('   cd microservices/susurro-test && npm test\n');
      console.log('5. Check if port 3001 is available:');
      console.log('   npm run kill-ports\n');
      console.log('⚠️  IMPORTANT: The microservice must:');
      console.log('   • Have uploads/ directory with write permissions');
      console.log('   • Successfully transcribe audio files');
      console.log('   • Return the word "Americans" in the transcript');
      console.log('━'.repeat(50));
    } else if (errorType === 'turbo') {
      console.log('\n🔧 HOW TO FIX TURBO ISSUES:');
      console.log('━'.repeat(50));
      console.log('1. Use the correct dev command:');
      console.log('   npm run dev        (automatically includes --turbo)\n');
      console.log('2. Use explicit turbo command:');
      console.log('   npm run dev:turbo  (if available)\n');
      console.log('3. Manual validation:');
      console.log('   npm run validate-turbo\n');
      console.log('4. Check Next.js configuration:');
      console.log('   Ensure experimental.turbo is configured in next.config.js\n');
      console.log('⚠️  IMPORTANT: Development server MUST use Turbopack!');
      console.log('   Webpack is BANNED in development mode.');
      console.log('━'.repeat(50));
    } else {
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
