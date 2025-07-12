#!/usr/bin/env node
/**
 * validate-translations.js
 *
 * Validates that all translation keys used in source code exist in all locale JSON files.
 * Exits with error and message if any keys are missing.
 */

const fs = require('fs');
const path = require('path');

// Recursively collect all .js, .jsx, .ts, .tsx files under a directory.
function getAllSourceFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllSourceFiles(fullPath));
    } else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

// Extract translation keys by matching t('key') or t("key") or t(`key`)
function extractTranslationKeys(srcDir) {
  const files = getAllSourceFiles(srcDir);
  const keys = new Set();
  const regex = /\bt\(['"`]([^'"`]+)['"`]\)/g;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = regex.exec(content))) {
      // Skip template literals that contain ${} placeholders
      if (!match[1].includes('${')) {
        keys.add(match[1]);
      }
    }
  }
  return Array.from(keys);
}

// Flatten nested objects into dot.notation keys
function flattenObject(obj, prefix = '', res = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const compositeKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flattenObject(value, compositeKey, res);
    } else {
      res[compositeKey] = true;
    }
  }
  return res;
}

// Load translation files for a given locale and flatten keys
function loadLocaleKeys(locale) {
  const localeDir = path.join(__dirname, '../locales', locale);
  const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.json'));
  const allKeys = {};
  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(localeDir, file), 'utf8'));
    flattenObject(content, '', allKeys);
  }
  return allKeys;
}

function validateTranslations() {
  const srcDir = path.join(__dirname, '../src');
  const usedKeys = extractTranslationKeys(srcDir);
  const locales = ['es', 'en'];
  const missing = {};

  for (const locale of locales) {
    const localeKeys = loadLocaleKeys(locale);
    missing[locale] = usedKeys.filter(key => !localeKeys[key]);
  }

  const hasMissing = locales.some(locale => missing[locale].length > 0);
  if (hasMissing) {
    console.error('❌ Missing translation keys detected:\n');
    for (const locale of locales) {
      if (missing[locale].length > 0) {
        console.error(
          `  [${locale}] Missing keys:\n    - ${missing[locale].join('\n    - ')}\n`
        );
      }
    }
    console.error(
      'Please add the missing keys to the appropriate locales JSON files and retry.'
    );
    process.exit(1);
  }

  console.log('✅ All translation keys validated');
}

if (require.main === module) {
  validateTranslations();
}

module.exports = { validateTranslations };
