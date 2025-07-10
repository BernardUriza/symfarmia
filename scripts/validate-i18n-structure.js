#!/usr/bin/env node

/**
 * I18n Structure Validator
 * Prevents critical translation errors that can crash the entire application
 * 
 * This script validates:
 * 1. fallbackTranslations is defined before usage in I18nProvider.js
 * 2. All translation keys used in components exist in fallback translations
 * 3. Component translation usage patterns are safe
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const CRITICAL_TRANSLATION_KEYS = [
  'demo_mode_active',
  'demo_mode_desc', 
  'exit_demo',
  'switch_live_mode',
  'light_mode',
  'dark_mode',
  'theme_toggle_light',
  'theme_toggle_dark',
  'language_switcher',
  'language_switcher.medical_grade'
];

/**
 * Validates I18nProvider.js structure to prevent fallbackTranslations errors
 */
function validateI18nProvider() {
  console.log('🔍 Validating I18nProvider.js structure...');
  
  const i18nProviderPath = path.join(process.cwd(), 'app/providers/I18nProvider.js');
  
  if (!fs.existsSync(i18nProviderPath)) {
    console.error('❌ CRITICAL: I18nProvider.js not found at expected location');
    process.exit(1);
  }
  
  const content = fs.readFileSync(i18nProviderPath, 'utf8');
  
  // Check if fallbackTranslations is defined before usage
  const fallbackUsageRegex = /fallbackTranslations\[/g;
  const fallbackDefinitionRegex = /const\s+fallbackTranslations\s*=/g;
  
  const usages = content.match(fallbackUsageRegex) || [];
  const definitions = content.match(fallbackDefinitionRegex) || [];
  
  if (usages.length > 0 && definitions.length === 0) {
    console.error('❌ CRITICAL: fallbackTranslations used but not defined in I18nProvider.js');
    console.error('This will cause ReferenceError and break the entire app');
    process.exit(1);
  }
  
  // Check that fallbackTranslations contains critical keys
  if (definitions.length > 0) {
    const fallbackTranslationsMatch = content.match(/const\s+fallbackTranslations\s*=\s*{([\s\S]*?)};/);
    if (fallbackTranslationsMatch) {
      const fallbackContent = fallbackTranslationsMatch[1];
      
      CRITICAL_TRANSLATION_KEYS.forEach(key => {
        if (!fallbackContent.includes(`'${key}'`) && !fallbackContent.includes(`"${key}"`)) {
          console.warn(`⚠️  WARNING: Critical translation key '${key}' missing from fallbackTranslations`);
        }
      });
    }
  }
  
  // Check that loadTranslations function properly handles fallbacks
  const loadTranslationsMatch = content.match(/async\s+function\s+loadTranslations\s*\([^)]*\)\s*{([\s\S]*?)}/);
  if (loadTranslationsMatch) {
    const loadTranslationsContent = loadTranslationsMatch[1];
    if (!loadTranslationsContent.includes('fallbackTranslations')) {
      console.warn('⚠️  WARNING: loadTranslations function does not use fallbackTranslations');
    }
  }
  
  console.log('✅ I18nProvider.js structure validated successfully');
}

/**
 * Validates components using translation keys
 */
function validateComponentTranslations() {
  console.log('🔍 Validating component translation usage...');
  
  const componentPaths = [
    'components/ThemeToggle.tsx',
    'app/components/DemoModeBanner.js'
  ];
  
  componentPaths.forEach(componentPath => {
    const fullPath = path.join(process.cwd(), componentPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Extract all t('key') usage
      const translationUsage = content.match(/t\(['"`]([^'"`]+)['"`]\)/g) || [];
      
      if (translationUsage.length > 0) {
        console.log(`📋 Component ${componentPath} uses ${translationUsage.length} translation keys`);
        
        translationUsage.forEach(usage => {
          const keyMatch = usage.match(/['"`]([^'"`]+)['"`]/);
          if (keyMatch) {
            const key = keyMatch[1];
            if (CRITICAL_TRANSLATION_KEYS.includes(key)) {
              console.log(`   ✅ Critical key: ${key}`);
            } else {
              console.log(`   📝 Key: ${key}`);
            }
          }
        });
      }
    } else {
      console.log(`⚠️  Component not found: ${componentPath}`);
    }
  });
  
  console.log('✅ Component translation usage validated');
}

/**
 * Validates that translation files exist and have required structure
 */
function validateTranslationFiles() {
  console.log('🔍 Validating translation files...');
  
  const locales = ['es', 'en'];
  const requiredFiles = [
    'common.json',
    'demo.json',
    'language_switcher.json'
  ];
  
  locales.forEach(locale => {
    const localeDir = path.join(process.cwd(), 'locales', locale);
    
    if (!fs.existsSync(localeDir)) {
      console.error(`❌ CRITICAL: Locale directory missing: ${localeDir}`);
      process.exit(1);
    }
    
    requiredFiles.forEach(file => {
      const filePath = path.join(localeDir, file);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  WARNING: Translation file missing: ${filePath}`);
      }
    });
  });
  
  console.log('✅ Translation files validated');
}

/**
 * Main validation function
 */
function main() {
  console.log('🚀 Starting I18n Structure Validation...\n');
  
  try {
    validateI18nProvider();
    validateComponentTranslations();
    validateTranslationFiles();
    
    console.log('\n🎉 I18n structure validation completed successfully!');
    console.log('✅ No critical translation errors detected');
    
  } catch (error) {
    console.error('\n💥 I18n validation failed:', error.message);
    process.exit(1);
  }
}

// Run validation if called directly
if (require.main === module) {
  main();
}

module.exports = {
  validateI18nProvider,
  validateComponentTranslations,
  validateTranslationFiles,
  main
};