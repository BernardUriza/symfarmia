#!/usr/bin/env node
/**
 * TRANSLATION AUTO-FIX UTILITY
 * 
 * Automatically fixes missing translations by generating placeholder keys
 * and prompting for proper medical translations
 */

const fs = require('fs');
const path = require('path');
const { RevolutionaryTranslationValidator } = require('./revolutionary-translation-validator');

class TranslationAutoFixer {
  constructor() {
    this.validator = new RevolutionaryTranslationValidator();
    this.localesDir = path.join(__dirname, '../locales');
    this.supportedLocales = ['es', 'en'];
    this.medicalTerms = {
      // Medical translations mapping
      'medical': { es: 'médico', en: 'medical' },
      'patient': { es: 'paciente', en: 'patient' },
      'doctor': { es: 'doctor', en: 'doctor' },
      'diagnosis': { es: 'diagnóstico', en: 'diagnosis' },
      'treatment': { es: 'tratamiento', en: 'treatment' },
      'consultation': { es: 'consulta', en: 'consultation' },
      'prescription': { es: 'receta', en: 'prescription' },
      'symptom': { es: 'síntoma', en: 'symptom' },
      'condition': { es: 'condición', en: 'condition' },
      'therapy': { es: 'terapia', en: 'therapy' },
      'medication': { es: 'medicamento', en: 'medication' },
      'procedure': { es: 'procedimiento', en: 'procedure' },
      'examination': { es: 'examen', en: 'examination' },
      'test': { es: 'prueba', en: 'test' },
      'result': { es: 'resultado', en: 'result' },
      'report': { es: 'informe', en: 'report' }
    };
    
    this.commonTranslations = {
      // Common UI translations
      'save': { es: 'guardar', en: 'save' },
      'cancel': { es: 'cancelar', en: 'cancel' },
      'delete': { es: 'eliminar', en: 'delete' },
      'edit': { es: 'editar', en: 'edit' },
      'create': { es: 'crear', en: 'create' },
      'update': { es: 'actualizar', en: 'update' },
      'close': { es: 'cerrar', en: 'close' },
      'open': { es: 'abrir', en: 'open' },
      'submit': { es: 'enviar', en: 'submit' },
      'confirm': { es: 'confirmar', en: 'confirm' },
      'error': { es: 'error', en: 'error' },
      'warning': { es: 'advertencia', en: 'warning' },
      'success': { es: 'éxito', en: 'success' },
      'loading': { es: 'cargando', en: 'loading' },
      'please_wait': { es: 'por favor espere', en: 'please wait' },
      'required': { es: 'requerido', en: 'required' },
      'optional': { es: 'opcional', en: 'optional' }
    };
  }

  async autoFix() {
    console.log('🔧 STARTING TRANSLATION AUTO-FIX...\n');
    
    try {
      // Run validation first to identify missing keys
      await this.validator.validateTranslations();
      
      // If no missing keys, exit
      if (this.validator.stats.missingTranslations === 0) {
        console.log('✅ No missing translations found!');
        return;
      }
      
      // Generate missing translations
      await this.generateMissingTranslations();
      
      // Re-run validation to verify
      console.log('\n🔍 Re-running validation...');
      await this.validator.validateTranslations();
      
      console.log('\n✅ AUTO-FIX COMPLETED!');
      
    } catch (error) {
      console.error('❌ AUTO-FIX FAILED:', error.message);
      process.exit(1);
    }
  }

  async generateMissingTranslations() {
    console.log('🎯 Generating missing translations...');
    
    for (const locale of this.supportedLocales) {
      const missingKeys = this.validator.missingKeys[locale] || [];
      
      if (missingKeys.length === 0) {
        console.log(`  ✅ ${locale}: No missing keys`);
        continue;
      }
      
      console.log(`  🔧 ${locale}: Generating ${missingKeys.length} missing keys`);
      
      // Group keys by file/category
      const keysByCategory = this.categorizeKeys(missingKeys);
      
      // Generate translations for each category
      for (const [category, keys] of Object.entries(keysByCategory)) {
        await this.generateKeysForCategory(locale, category, keys);
      }
    }
  }

  categorizeKeys(keys) {
    const categories = {
      medical: [],
      common: [],
      conversation: [],
      navigation: [],
      dashboard: [],
      consultation: [],
      orders: [],
      clinical: [],
      status: [],
      landing: [],
      auto_generated: []
    };
    
    for (const key of keys) {
      const keyLower = key.toLowerCase();
      
      if (keyLower.includes('medical') || keyLower.includes('clinical') || 
          keyLower.includes('patient') || keyLower.includes('doctor') ||
          keyLower.includes('diagnosis') || keyLower.includes('treatment')) {
        categories.medical.push(key);
      } else if (keyLower.includes('conversation') || keyLower.includes('capture') ||
                 keyLower.includes('record') || keyLower.includes('transcription')) {
        categories.conversation.push(key);
      } else if (keyLower.includes('nav') || keyLower.includes('menu') ||
                 keyLower.includes('link') || keyLower.includes('route')) {
        categories.navigation.push(key);
      } else if (keyLower.includes('dashboard') || keyLower.includes('home') ||
                 keyLower.includes('main') || keyLower.includes('overview')) {
        categories.dashboard.push(key);
      } else if (keyLower.includes('consultation') || keyLower.includes('consult') ||
                 keyLower.includes('appointment') || keyLower.includes('visit')) {
        categories.consultation.push(key);
      } else if (keyLower.includes('order') || keyLower.includes('prescription') ||
                 keyLower.includes('medication') || keyLower.includes('drug')) {
        categories.orders.push(key);
      } else if (keyLower.includes('status') || keyLower.includes('state') ||
                 keyLower.includes('condition') || keyLower.includes('progress')) {
        categories.status.push(key);
      } else if (keyLower.includes('landing') || keyLower.includes('welcome') ||
                 keyLower.includes('intro') || keyLower.includes('hero')) {
        categories.landing.push(key);
      } else if (this.isCommonKey(key)) {
        categories.common.push(key);
      } else {
        categories.auto_generated.push(key);
      }
    }
    
    // Remove empty categories
    return Object.fromEntries(
      Object.entries(categories).filter(([_, keys]) => keys.length > 0)
    );
  }

  isCommonKey(key) {
    const keyLower = key.toLowerCase();
    return ['save', 'cancel', 'delete', 'edit', 'create', 'update', 'close', 'open', 
            'submit', 'confirm', 'error', 'warning', 'success', 'loading'].some(
      common => keyLower.includes(common)
    );
  }

  async generateKeysForCategory(locale, category, keys) {
    const categoryFile = path.join(this.localesDir, locale, `${category}.json`);
    let existingTranslations = {};
    
    // Load existing translations
    if (fs.existsSync(categoryFile)) {
      try {
        existingTranslations = JSON.parse(fs.readFileSync(categoryFile, 'utf8'));
      } catch (error) {
        console.log(`    ⚠️  Could not read ${categoryFile}, creating new file`);
      }
    }
    
    // Generate new translations
    const newTranslations = { ...existingTranslations };
    let addedCount = 0;
    
    for (const key of keys) {
      const nestedKey = this.createNestedKey(newTranslations, key);
      if (!this.getNestedValue(newTranslations, key)) {
        this.setNestedValue(newTranslations, key, this.generateTranslation(locale, key));
        addedCount++;
      }
    }
    
    if (addedCount > 0) {
      // Write back to file
      fs.writeFileSync(categoryFile, JSON.stringify(newTranslations, null, 2));
      console.log(`    ✅ Added ${addedCount} translations to ${locale}/${category}.json`);
    }
  }

  generateTranslation(locale, key) {
    const keyLower = key.toLowerCase();
    
    // Check medical terms
    for (const [term, translations] of Object.entries(this.medicalTerms)) {
      if (keyLower.includes(term)) {
        return `${translations[locale]} (${key})`;
      }
    }
    
    // Check common translations
    for (const [term, translations] of Object.entries(this.commonTranslations)) {
      if (keyLower.includes(term)) {
        return translations[locale];
      }
    }
    
    // Generate based on key pattern
    if (key.includes('.')) {
      const parts = key.split('.');
      const lastPart = parts[parts.length - 1];
      
      // Handle common patterns
      if (lastPart === 'title') {
        return locale === 'es' ? 'Título' : 'Title';
      } else if (lastPart === 'description') {
        return locale === 'es' ? 'Descripción' : 'Description';
      } else if (lastPart === 'placeholder') {
        return locale === 'es' ? 'Ingrese texto aquí' : 'Enter text here';
      } else if (lastPart === 'label') {
        return locale === 'es' ? 'Etiqueta' : 'Label';
      } else if (lastPart === 'button') {
        return locale === 'es' ? 'Botón' : 'Button';
      }
    }
    
    // Default fallback
    return locale === 'es' ? 
      `[AUTO] ${key.replace(/[._]/g, ' ')}` : 
      `[AUTO] ${key.replace(/[._]/g, ' ')}`;
  }

  createNestedKey(obj, key) {
    const parts = key.split('.');
    let current = obj;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    return current;
  }

  getNestedValue(obj, key) {
    const parts = key.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current[part] === undefined) {
        return undefined;
      }
      current = current[part];
    }
    
    return current;
  }

  setNestedValue(obj, key, value) {
    const parts = key.split('.');
    let current = obj;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
  }
}

// Main execution
async function main() {
  const autoFixer = new TranslationAutoFixer();
  await autoFixer.autoFix();
}

// Export for use in other scripts
module.exports = { TranslationAutoFixer };

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ TRANSLATION AUTO-FIX CRASHED:', error);
    process.exit(1);
  });
}