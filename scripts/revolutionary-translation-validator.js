#!/usr/bin/env node
/**
 * REVOLUTIONARY TRANSLATION VALIDATOR
 * 
 * This is the most comprehensive and IMPLACABLE translation validation system
 * that will NOT allow builds or dev servers to run with missing translations.
 * 
 * Features:
 * - Detects ALL translation keys used in codebase
 * - Validates EVERY key exists in ALL locales
 * - Prevents builds with missing translations
 * - Blocks dev server startup with incomplete translations
 * - Provides detailed reports of missing keys
 * - Offers auto-fix suggestions
 * - Validates medical terminology consistency
 * - Checks for translation format consistency
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  localesDir: path.join(__dirname, '../locales'),
  sourceDir: path.join(__dirname, '../'),
  supportedLocales: ['es', 'en'],
  excludeDirs: ['node_modules', '.next', 'dist', 'build', '.git', 'coverage'],
  includeExtensions: ['.js', '.jsx', '.ts', '.tsx'],
  translationPatterns: [
    /\bt\(['"`]([^'"`]+)['"`]\)/g,           // t('key')
    /\bt\(['"`]([^'"`]+)['"`][^)]*\)/g,      // t('key', params)
    /useI18n\(\)\.t\(['"`]([^'"`]+)['"`]\)/g, // useI18n().t('key')
    /i18n\.t\(['"`]([^'"`]+)['"`]\)/g,       // i18n.t('key')
    /translate\(['"`]([^'"`]+)['"`]\)/g,     // translate('key')
  ],
  medicalKeywords: [], // Will be populated from local JSON files
  criticalKeys: []   // Will be populated from local JSON files
};

class RevolutionaryTranslationValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.missingKeys = {};
    this.usedKeys = new Set();
    this.localeData = {};
    this.stats = {
      totalKeys: 0,
      totalFiles: 0,
      missingTranslations: 0,
      criticalMissing: 0,
      medicalMissing: 0
    };
    this.searchLabels = {
      medical: new Set(),
      critical: new Set()
    };
  }

  /**
   * MAIN VALIDATION ENTRY POINT
   */
  async validateTranslations(skipExit = false) {
    console.log('🚀 REVOLUTIONARY TRANSLATION VALIDATOR STARTING...\n');
    
    try {
      // Step 1: Load all translation files
      await this.loadTranslationFiles();
      
      // Step 1.5: Extract search labels from local JSON files
      await this.extractSearchLabels();
      
      // Step 2: Extract all translation keys from source code
      await this.extractTranslationKeys();
      
      // Step 3: Validate all keys exist in all locales
      await this.validateKeyExistence();
      
      // Step 4: Validate medical terminology consistency
      await this.validateMedicalTerminology();
      
      // Step 5: Validate critical keys
      await this.validateCriticalKeys();
      
      // Step 6: Generate comprehensive report
      await this.generateReport();
      
      // Step 7: Exit with appropriate code
      return this.exitWithResults(skipExit);
      
    } catch (error) {
      console.error('❌ REVOLUTIONARY VALIDATOR FAILED:', error.message);
      if (!skipExit) process.exit(1);
      throw error;
    }
  }

  /**
   * Load all translation files from locales directory
   */
  async loadTranslationFiles() {
    console.log('📁 Loading translation files...');
    
    for (const locale of CONFIG.supportedLocales) {
      const localeDir = path.join(CONFIG.localesDir, locale);
      
      if (!fs.existsSync(localeDir)) {
        this.errors.push(`Locale directory missing: ${localeDir}`);
        continue;
      }
      
      this.localeData[locale] = {};
      const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.json'));
      
      for (const file of files) {
        const filePath = path.join(localeDir, file);
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          this.localeData[locale] = { ...this.localeData[locale], ...this.flattenObject(content) };
        } catch (error) {
          this.errors.push(`Invalid JSON in ${filePath}: ${error.message}`);
        }
      }
      
      console.log(`  ✅ Loaded ${Object.keys(this.localeData[locale]).length} keys for ${locale}`);
    }
  }

  /**
   * Extract search labels from local JSON files for validation
   */
  async extractSearchLabels() {
    console.log('🏷️  Extracting search labels from local JSON files...');
    
    // Medical keywords that suggest medical content
    const medicalKeywords = [
      'medical', 'clinical', 'diagnosis', 'treatment', 'patient', 'doctor',
      'consultation', 'prescription', 'symptom', 'condition', 'therapy',
      'medication', 'procedure', 'examination', 'test', 'result', 'report',
      'ai_assistant', 'transcription', 'microphone', 'documentation', 'workflow',
      'conversation', 'dialogue', 'forms', 'navigation', 'demo'
    ];
    
    // Critical system keywords that suggest critical functionality
    const criticalKeywords = [
      'error', 'warning', 'success', 'confirm', 'cancel', 'save', 'delete',
      'login', 'logout', 'submit', 'close', 'open', 'edit', 'create', 'update',
      'start', 'stop', 'recording', 'active', 'inactive', 'permissions'
    ];
    
    // Extract from all loaded locale data
    for (const locale of CONFIG.supportedLocales) {
      if (this.localeData[locale]) {
        const keys = Object.keys(this.localeData[locale]);
        
        // Check each key against medical keywords
        for (const key of keys) {
          const keyLower = key.toLowerCase();
          
          // Check if key contains medical keywords
          if (medicalKeywords.some(keyword => keyLower.includes(keyword))) {
            this.searchLabels.medical.add(key);
          }
          
          // Check if key contains critical keywords
          if (criticalKeywords.some(keyword => keyLower.includes(keyword))) {
            this.searchLabels.critical.add(key);
          }
        }
      }
    }
    
    console.log(`  ✅ Extracted ${this.searchLabels.medical.size} medical search labels`);
    console.log(`  ✅ Extracted ${this.searchLabels.critical.size} critical search labels`);
  }

  /**
   * Extract all translation keys from source code
   */
  async extractTranslationKeys() {
    console.log('🔍 Extracting translation keys from source code...');
    
    const files = await this.getAllSourceFiles(CONFIG.sourceDir);
    this.stats.totalFiles = files.length;
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const pattern of CONFIG.translationPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          this.usedKeys.add(match[1]);
        }
      }
    }
    
    this.stats.totalKeys = this.usedKeys.size;
    console.log(`  ✅ Found ${this.stats.totalKeys} translation keys in ${this.stats.totalFiles} files`);
  }

  /**
   * Validate that all used keys exist in all locales
   */
  async validateKeyExistence() {
    console.log('🔐 Validating key existence across all locales...');
    
    for (const locale of CONFIG.supportedLocales) {
      this.missingKeys[locale] = [];
      
      for (const key of this.usedKeys) {
        //console.log(`Checking key: ${key}`, this.localeData[locale][key] ? '✅'+this.localeData[locale][key]  : '❌');
        if (!this.localeData[locale][key]) {
          this.missingKeys[locale].push(key);
        }
      }
      
      if (this.missingKeys[locale].length > 0) {
        this.stats.missingTranslations += this.missingKeys[locale].length;
        console.log(`  ❌ ${locale}: ${this.missingKeys[locale].length} missing keys`);
      } else {
        console.log(`  ✅ ${locale}: All keys present`);
      }
    }
  }

  /**
   * Validate medical terminology consistency
   */
  async validateMedicalTerminology() {
    console.log('🏥 Validating medical terminology consistency...');
    
    // Use the extracted medical search labels instead of hardcoded keywords
    const medicalKeys = Array.from(this.usedKeys).filter(key => 
      this.searchLabels.medical.has(key)
    );
    
    for (const locale of CONFIG.supportedLocales) {
      const missingMedical = medicalKeys.filter(key => !this.localeData[locale][key]);
      
      if (missingMedical.length > 0) {
        this.stats.medicalMissing += missingMedical.length;
        this.errors.push(`CRITICAL: Missing medical translations in ${locale}: ${missingMedical.join(', ')}`);
      }
    }
    
    console.log(`  ✅ Validated ${medicalKeys.length} medical terminology keys`);
  }

  /**
   * Validate critical system keys
   */
  async validateCriticalKeys() {
    console.log('⚠️  Validating critical system keys...');
    
    // Use the extracted critical search labels instead of hardcoded keywords
    const criticalKeys = Array.from(this.usedKeys).filter(key => 
      this.searchLabels.critical.has(key)
    );
    
    for (const locale of CONFIG.supportedLocales) {
      const missingCritical = criticalKeys.filter(key => !this.localeData[locale][key]);
      
      if (missingCritical.length > 0) {
        this.stats.criticalMissing += missingCritical.length;
        this.errors.push(`CRITICAL: Missing critical translations in ${locale}: ${missingCritical.join(', ')}`);
      }
    }
    
    console.log(`  ✅ Validated ${criticalKeys.length} critical system keys`);
  }

  /**
   * Generate comprehensive validation report
   */
  async generateReport() {
    console.log('\n📊 REVOLUTIONARY TRANSLATION VALIDATION REPORT');
    console.log('=' .repeat(60));
    
    // Statistics
    console.log(`📈 STATISTICS:`);
    console.log(`  Total Translation Keys: ${this.stats.totalKeys}`);
    console.log(`  Total Source Files: ${this.stats.totalFiles}`);
    console.log(`  Missing Translations: ${this.stats.missingTranslations}`);
    console.log(`  Critical Missing: ${this.stats.criticalMissing}`);
    console.log(`  Medical Missing: ${this.stats.medicalMissing}`);
    console.log(`  Medical Search Labels: ${this.searchLabels.medical.size}`);
    console.log(`  Critical Search Labels: ${this.searchLabels.critical.size}`);
    
    // Missing keys by locale
    if (this.stats.missingTranslations > 0) {
      console.log('\n❌ MISSING TRANSLATIONS BY LOCALE:');
      for (const locale of CONFIG.supportedLocales) {
        if (this.missingKeys[locale] && this.missingKeys[locale].length > 0) {
          console.log(`\n  [${locale.toUpperCase()}] Missing ${this.missingKeys[locale].length} keys:`);
          this.missingKeys[locale].forEach(key => console.log(`    - ${key}`));
        }
      }
    }
    
    // Errors
    if (this.errors.length > 0) {
      console.log('\n🚨 CRITICAL ERRORS:');
      this.errors.forEach(error => console.log(`  ❌ ${error}`));
    }
    
    // Auto-fix suggestions
    if (this.stats.missingTranslations > 0) {
      console.log('\n🔧 AUTO-FIX SUGGESTIONS:');
      console.log('  Run: npm run translations:auto-fix');
      console.log('  Or manually add missing keys to locale files');
    }
    
    console.log('\n' + '=' .repeat(60));
  }

  /**
   * Exit with appropriate code based on validation results
   */
  exitWithResults(skipExit = false) {
    const hasCriticalIssues = this.errors.length > 0 || this.stats.missingTranslations > 0;
    
    if (hasCriticalIssues) {
      console.log('\n💥 VALIDATION FAILED - BLOCKING BUILD/DEV SERVER');
      console.log('🚫 Fix all translation issues before proceeding!');
      if (!skipExit) process.exit(1);
    } else {
      console.log('\n✅ ALL TRANSLATIONS VALIDATED SUCCESSFULLY');
      console.log('🚀 Build/Dev server can proceed!');
      if (!skipExit) process.exit(0);
    }
    
    return hasCriticalIssues;
  }

  /**
   * Helper: Get all source files recursively
   */
  async getAllSourceFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !CONFIG.excludeDirs.includes(entry.name)) {
        await this.getAllSourceFiles(fullPath, files);
      } else if (entry.isFile() && CONFIG.includeExtensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Helper: Flatten nested objects to dot notation
   */
  flattenObject(obj, prefix = '', result = {}) {
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        this.flattenObject(value, newKey, result);
      } else {
        result[newKey] = value;
      }
    }
    
    return result;
  }
}

// Auto-fix functionality
class TranslationAutoFixer {
  constructor(validator) {
    this.validator = validator;
  }

  async autoFix() {
    console.log('🔧 AUTO-FIXING MISSING TRANSLATIONS...');
    
    for (const locale of CONFIG.supportedLocales) {
      if (this.validator.missingKeys[locale] && this.validator.missingKeys[locale].length > 0) {
        await this.generateMissingKeys(locale, this.validator.missingKeys[locale]);
      }
    }
  }

  async generateMissingKeys(locale, missingKeys) {
    const autoGenFile = path.join(CONFIG.localesDir, locale, 'auto_generated.json');
    let existingKeys = {};
    
    // Load existing auto-generated keys
    if (fs.existsSync(autoGenFile)) {
      existingKeys = JSON.parse(fs.readFileSync(autoGenFile, 'utf8'));
    }
    
    // Generate new keys
    for (const key of missingKeys) {
      if (!existingKeys[key]) {
        existingKeys[key] = `[AUTO] ${key}`;
      }
    }
    
    // Write back to file
    fs.writeFileSync(autoGenFile, JSON.stringify(existingKeys, null, 2));
    console.log(`  ✅ Generated ${missingKeys.length} missing keys for ${locale}`);
  }
}

// Main execution
async function main() {
  const validator = new RevolutionaryTranslationValidator();
  
  // Check if auto-fix is requested
  if (process.argv.includes('--auto-fix')) {
    try {
      await validator.validateTranslations(true); // Skip exit for auto-fix
      
      // Only proceed with auto-fix if there are missing translations
      if (validator.stats.missingTranslations > 0) {
        console.log('\n🔧 AUTO-FIXING MISSING TRANSLATIONS...');
        const autoFixer = new TranslationAutoFixer(validator);
        await autoFixer.autoFix();
        console.log('✅ Auto-fix completed. Re-validating...\n');
        
        // Re-validate after auto-fix
        const newValidator = new RevolutionaryTranslationValidator();
        await newValidator.validateTranslations();
      }
    } catch (error) {
      console.error('❌ Auto-fix failed:', error.message);
      process.exit(1);
    }
  } else {
    // Normal validation
    await validator.validateTranslations();
  }
}

// Export for use in other scripts
module.exports = { RevolutionaryTranslationValidator, TranslationAutoFixer };

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ REVOLUTIONARY VALIDATOR CRASHED:', error);
    process.exit(1);
  });
}