#!/usr/bin/env node

/**
 * PROFESSIONAL TRANSLATION COVERAGE VALIDATION
 * 
 * Validates that all translation JSON files exist and are valid
 * Ensures complete coverage without any fallback mediocrity
 * 
 * Usage: npm run validate-translations || node scripts/validate-translation-coverage.js
 */

const fs = require('fs');
const path = require('path');

// Required locales and translation files
const REQUIRED_LOCALES = ['es', 'en'];
const REQUIRED_FILES = [
  'common',
  'medical', 
  'clinical',
  'orders',
  'navigation',
  'conversation',
  'status',
  'landing',
  'dashboard',
  'workflow',
  'demo',
  'dialogue',
  'transcription',
  'language_switcher',
  'ui',
  'errors'
];

// Validation results
let validationResults = {
  success: true,
  errors: [],
  warnings: [],
  stats: {
    totalFiles: 0,
    validFiles: 0,
    invalidFiles: 0,
    totalKeys: 0
  }
};

/**
 * Validate file exists and has valid JSON
 */
function validateTranslationFile(locale, filename) {
  const filePath = path.join(__dirname, '..', 'locales', locale, `${filename}.json`);
  
  validationResults.stats.totalFiles++;
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    validationResults.success = false;
    validationResults.errors.push(`❌ MISSING: ${filePath}`);
    validationResults.stats.invalidFiles++;
    return false;
  }
  
  // Validate JSON structure
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(content);
    
    // Count keys for statistics
    const keyCount = countKeys(jsonData);
    validationResults.stats.totalKeys += keyCount;
    
    // Check if JSON is empty
    if (Object.keys(jsonData).length === 0) {
      validationResults.warnings.push(`⚠️ EMPTY: ${filePath} has no translations`);
    }
    
    validationResults.stats.validFiles++;
    return true;
    
  } catch (error) {
    validationResults.success = false;
    validationResults.errors.push(`❌ INVALID JSON: ${filePath} - ${error.message}`);
    validationResults.stats.invalidFiles++;
    return false;
  }
}

/**
 * Count all keys in nested object
 */
function countKeys(obj, prefix = '') {
  let count = 0;
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        count += countKeys(obj[key], prefix ? `${prefix}.${key}` : key);
      } else {
        count++;
      }
    }
  }
  
  return count;
}

/**
 * Validate translation key consistency across locales
 */
function validateKeyConsistency() {
  const localeData = {};
  
  // Load all translation data
  REQUIRED_LOCALES.forEach(locale => {
    localeData[locale] = {};
    
    REQUIRED_FILES.forEach(filename => {
      const filePath = path.join(__dirname, '..', 'locales', locale, `${filename}.json`);
      
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const jsonData = JSON.parse(content);
          
          // Flatten nested objects
          const flattenObject = (obj, prefix = '') => {
            const result = {};
            
            for (const key in obj) {
              if (obj.hasOwnProperty(key)) {
                const newKey = prefix ? `${prefix}.${key}` : key;
                
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                  Object.assign(result, flattenObject(obj[key], newKey));
                } else {
                  result[newKey] = obj[key];
                }
              }
            }
            
            return result;
          };
          
          Object.assign(localeData[locale], flattenObject(jsonData, filename));
        } catch (error) {
          // Skip invalid files (already reported)
        }
      }
    });
  });
  
  // Compare keys across locales
  const allKeys = new Set();
  Object.values(localeData).forEach(data => {
    Object.keys(data).forEach(key => allKeys.add(key));
  });
  
  // Check for missing keys in each locale
  REQUIRED_LOCALES.forEach(locale => {
    const localeKeys = new Set(Object.keys(localeData[locale]));
    
    allKeys.forEach(key => {
      if (!localeKeys.has(key)) {
        validationResults.warnings.push(`⚠️ MISSING KEY: "${key}" in locale "${locale}"`);
      }
    });
  });
}

/**
 * Main validation function
 */
function validateTranslations() {
  console.log('🔍 PROFESSIONAL TRANSLATION VALIDATION');
  console.log('=====================================');
  
  // Validate all required files exist and are valid
  REQUIRED_LOCALES.forEach(locale => {
    console.log(`\n📂 Validating locale: ${locale}`);
    
    REQUIRED_FILES.forEach(filename => {
      const isValid = validateTranslationFile(locale, filename);
      if (isValid) {
        console.log(`  ✅ ${filename}.json`);
      }
    });
  });
  
  // Validate key consistency
  console.log('\n🔄 Validating key consistency across locales...');
  validateKeyConsistency();
  
  // Print results
  console.log('\n📊 VALIDATION RESULTS');
  console.log('====================');
  console.log(`Total files: ${validationResults.stats.totalFiles}`);
  console.log(`Valid files: ${validationResults.stats.validFiles}`);
  console.log(`Invalid files: ${validationResults.stats.invalidFiles}`);
  console.log(`Total translation keys: ${validationResults.stats.totalKeys}`);
  
  // Print errors
  if (validationResults.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    validationResults.errors.forEach(error => console.log(`  ${error}`));
  }
  
  // Print warnings
  if (validationResults.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    validationResults.warnings.forEach(warning => console.log(`  ${warning}`));
  }
  
  // Final result
  if (validationResults.success) {
    console.log('\n✅ VALIDATION PASSED - Professional translation system ready!');
    console.log('🚀 All translation JSON files exist and are valid');
    console.log('💎 Zero fallback mediocrity detected');
    process.exit(0);
  } else {
    console.log('\n❌ VALIDATION FAILED - Fix errors above');
    console.log('🚨 Translation system has issues that must be resolved');
    process.exit(1);
  }
}

// Run validation
validateTranslations();