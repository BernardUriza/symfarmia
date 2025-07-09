const fs = require('fs');
const path = require('path');

const getAllJSXFiles = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllJSXFiles(fullPath));
    } else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  });
  return files;
};

const extractTranslationKeys = (directory) => {
  const files = getAllJSXFiles(directory);
  const keys = new Set();
  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(/\bt\(['"`]([^'"`]+)['"`]\)/g);
    if (matches) {
      matches.forEach((match) => {
        const key = match.match(/['"`]([^'"`]+)['"`]/)[1];
        keys.add(key);
      });
    }
  });
  return Array.from(keys);
};

const addMissingTranslations = (missingKeys) => {
  missingKeys.forEach(({ key, locale }) => {
    const filePath = path.join(__dirname, `../locales/${locale}/common.json`);
    const translations = require(filePath);
    translations[key] = `TODO_TRANSLATE_${key.toUpperCase()}`;
    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));
    console.log(`➕ Added placeholder for ${locale}:${key}`);
  });
};

const generateTranslationTests = (keys) => {
  const esTranslations = require(path.join(__dirname, '../locales/es/common.json'));
  const enTranslations = require(path.join(__dirname, '../locales/en/common.json'));
  const testCases = keys
    .map((key) => {
      return `test('${key} translation exists', () => {\n  expect(esTranslations['${key}']).toBeDefined();\n  expect(enTranslations['${key}']).toBeDefined();\n  expect(esTranslations['${key}']).not.toMatch(/TODO_TRANSLATE/);\n});`;
    })
    .join('\n');
  const content = `const esTranslations = require('../locales/es/common.json');\nconst enTranslations = require('../locales/en/common.json');\n\ndescribe('Auto Generated Translation Tests', () => {\n${testCases}\n});\n`;
  fs.writeFileSync('./tests/auto-generated-translation.test.js', content);
};

const validateTranslations = () => {
  const esTranslations = require(path.join(__dirname, '../locales/es/common.json'));
  const enTranslations = require(path.join(__dirname, '../locales/en/common.json'));
  const usedKeys = extractTranslationKeys('./src');
  const missingKeys = [];

  usedKeys.forEach((key) => {
    if (!esTranslations[key]) {
      missingKeys.push({ key, locale: 'es' });
    }
    if (!enTranslations[key]) {
      missingKeys.push({ key, locale: 'en' });
    }
  });

  generateTranslationTests(usedKeys);

  if (missingKeys.length > 0) {
    console.error('❌ MISSING TRANSLATION KEYS:');
    missingKeys.forEach(({ key, locale }) => {
      console.error(`  ${locale}: "${key}"`);
    });
    addMissingTranslations(missingKeys);
    process.exit(1);
  }

  console.log('✅ All translation keys validated');
};

if (require.main === module) {
  validateTranslations();
}

module.exports = { validateTranslations, extractTranslationKeys };
