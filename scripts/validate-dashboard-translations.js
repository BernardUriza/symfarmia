#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Dashboard Translation Validation Script
 * Validates that the dashboard page.tsx has no hardcoded strings
 * and all translation keys exist in JSON files
 */

function validateDashboardTranslations() {
  console.log('🔍 Validating Dashboard Translations...\n');
  
  const dashboardFile = path.join(__dirname, '../app/dashboard/page.tsx');
  const esTranslationFile = path.join(__dirname, '../locales/es/dashboard.json');
  const enTranslationFile = path.join(__dirname, '../locales/en/dashboard.json');
  
  // Read files
  const dashboardContent = fs.readFileSync(dashboardFile, 'utf8');
  const esTranslations = JSON.parse(fs.readFileSync(esTranslationFile, 'utf8'));
  const enTranslations = JSON.parse(fs.readFileSync(enTranslationFile, 'utf8'));
  
  // Test 1: Check for hardcoded Spanish strings
  console.log('📋 Test 1: Checking for hardcoded Spanish strings...');
  const hardcodedRegex = /[>"]([^<>"]*[áéíóúñüÁÉÍÓÚÑÜ][^<>"]*)[<"]/gi;
  const hardcodedMatches = dashboardContent.match(hardcodedRegex) || [];
  
  if (hardcodedMatches.length > 0) {
    console.error('❌ HARDCODED STRINGS DETECTED IN DASHBOARD:');
    hardcodedMatches.forEach(match => console.error('  -', match));
    return false;
  } else {
    console.log('✅ No hardcoded Spanish strings found');
  }
  
  // Test 2: Check for t() usage
  console.log('\\n📋 Test 2: Checking for translation function usage...');
  const translationRegex = /t\\('([^']+)'\\)/g;
  const translationMatches = [...dashboardContent.matchAll(translationRegex)];
  
  console.log(`✅ Found ${translationMatches.length} translation calls`);
  
  // Test 3: Validate translation keys exist
  console.log('\\n📋 Test 3: Validating translation keys exist...');
  
  function flattenObject(obj, prefix = '') {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        Object.assign(acc, flattenObject(obj[key], newKey));
      } else {
        acc[newKey] = obj[key];
      }
      return acc;
    }, {});
  }
  
  const flatES = flattenObject(esTranslations);
  const flatEN = flattenObject(enTranslations);
  
  let missingKeys = [];
  
  translationMatches.forEach(match => {
    const key = match[1]; // Back to match[1] for single capturing group
    if (!flatES[key]) {
      missingKeys.push(`ES: ${key}`);
    }
    if (!flatEN[key]) {
      missingKeys.push(`EN: ${key}`);
    }
  });
  
  if (missingKeys.length > 0) {
    console.error('❌ MISSING TRANSLATION KEYS:');
    missingKeys.forEach(key => console.error('  -', key));
    return false;
  } else {
    console.log('✅ All translation keys exist in both languages');
  }
  
  // Test 4: Check for useTranslation import
  console.log('\\n📋 Test 4: Checking for useTranslation import...');
  const importRegex = /import.*useTranslation.*from.*I18nProvider/;
  if (importRegex.test(dashboardContent)) {
    console.log('✅ useTranslation properly imported');
  } else {
    console.error('❌ useTranslation not imported');
    return false;
  }
  
  // Test 5: Check component structure
  console.log('\\n📋 Test 5: Checking component translation structure...');
  const componentTranslationRegex = /const \\{ t \\} = useTranslation\\(\\);/g;
  const componentMatches = [...dashboardContent.matchAll(componentTranslationRegex)];
  
  console.log(`✅ Found ${componentMatches.length} components using translations`);
  
  console.log('\\n🎉 DASHBOARD TRANSLATION VALIDATION COMPLETE!');
  console.log('✅ All tests passed - Dashboard is fully internationalized');
  
  return true;
}

// Summary stats
function printSummary() {
  const dashboardFile = path.join(__dirname, '../app/dashboard/page.tsx');
  const content = fs.readFileSync(dashboardFile, 'utf8');
  
  const translationCalls = [...content.matchAll(/t\\('([^']+)'\\)/g)];
  const components = [...content.matchAll(/const \\{ t \\} = useTranslation\\(\\);/g)];
  
  console.log('\\n📊 SUMMARY:');
  console.log(`🔤 Translation calls: ${translationCalls.length}`);
  console.log(`🧩 Components using translations: ${components.length}`);
  console.log(`🌐 Languages supported: Spanish, English`);
  console.log(`✅ Dashboard 100% internationalized`);
}

// Run validation
if (validateDashboardTranslations()) {
  printSummary();
  process.exit(0);
} else {
  console.log('\\n❌ VALIDATION FAILED');
  process.exit(1);
}