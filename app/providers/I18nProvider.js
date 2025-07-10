"use client";
import { createContext, useContext, useEffect, useState } from 'react';

export const I18nContext = createContext();

// Critical fallback translations to prevent app crashes
const fallbackTranslations = {
  'es': {
    'demo_mode_active': 'Modo Demo Activo',
    'demo_mode_desc': 'Estás visualizando SYMFARMIA con datos de ejemplo',
    'exit_demo': 'Salir del demo',
    'switch_live_mode': 'Cambiar a modo real',
    'light_mode': 'Modo Claro',
    'dark_mode': 'Modo Oscuro',
    'theme_toggle_light': 'Modo Claro',
    'theme_toggle_dark': 'Modo Oscuro',
    'language_switcher': 'Cambiar idioma',
    'language_switcher.medical_grade': 'Cambio de idioma grado médico',
    'error_boundary_title': 'Error del Sistema',
    'error_boundary_desc': 'Se detectó un error inesperado',
    'try_again': 'Intentar de nuevo'
  },
  'en': {
    'demo_mode_active': 'Demo Mode Active',
    'demo_mode_desc': 'You are viewing SYMFARMIA with sample data',
    'exit_demo': 'Exit demo',
    'switch_live_mode': 'Switch to live mode',
    'light_mode': 'Light Mode',
    'dark_mode': 'Dark Mode',
    'theme_toggle_light': 'Light Mode',
    'theme_toggle_dark': 'Dark Mode',
    'language_switcher': 'Switch language',
    'language_switcher.medical_grade': 'Medical grade language switch',
    'error_boundary_title': 'System Error',
    'error_boundary_desc': 'An unexpected error was detected',
    'try_again': 'Try again'
  }
};

// Dynamic translations loader with enhanced error handling
async function loadTranslations(locale) {
  try {
    const modules = await Promise.all([
      import(`../../locales/${locale}/common.json`),
      import(`../../locales/${locale}/medical.json`),
      import(`../../locales/${locale}/clinical.json`),
      import(`../../locales/${locale}/orders.json`),
      import(`../../locales/${locale}/navigation.json`),
      import(`../../locales/${locale}/conversation.json`),
      import(`../../locales/${locale}/status.json`),
      import(`../../locales/${locale}/landing.json`),
      import(`../../locales/${locale}/dashboard.json`),
      import(`../../locales/${locale}/workflow.json`),
      import(`../../locales/${locale}/demo.json`),
      import(`../../locales/${locale}/dialogue.json`),
      import(`../../locales/${locale}/transcription.json`),
      import(`../../locales/${locale}/language_switcher.json`),
    ]);
    
    // Flatten nested objects for easier access
    const flattenObject = (obj, prefix = '') => {
      return Object.keys(obj).reduce((acc, key) => {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          Object.assign(acc, flattenObject(obj[key], newKey));
        } else {
          acc[newKey] = obj[key];
        }
        return acc;
      }, {});
    };

    const combinedTranslations = {};
    modules.forEach(module => {
      Object.assign(combinedTranslations, flattenObject(module.default || module));
    });

    // Merge with fallbacks to ensure no missing keys
    return { ...fallbackTranslations[locale], ...combinedTranslations };
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error);
    // Return fallbacks with error logging
    return fallbackTranslations[locale] || fallbackTranslations['es'];
  }
}


function detectUserLanguage() {
  if (typeof window === 'undefined') return 'es';
  
  // Check localStorage first
  const stored = localStorage.getItem('preferredLanguage');
  if (stored && ['es', 'en'].includes(stored)) return stored;
  
  // Check browser language
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('en')) return 'en';
  
  return 'es'; // Default to Spanish
}

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState('es'); // Always start with 'es' for consistent SSR
  const [hasHydrated, setHasHydrated] = useState(false);
  const [translations, setTranslations] = useState({});
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(true);

  // Load translations when locale changes
  useEffect(() => {
    async function loadAndSetTranslations() {
      setIsLoadingTranslations(true);
      const loadedTranslations = await loadTranslations(locale);
      setTranslations(loadedTranslations);
      setIsLoadingTranslations(false);
    }
    
    loadAndSetTranslations();
  }, [locale]);

  useEffect(() => {
    // Only run once on client side - detect and set user language after hydration
    if (typeof window !== 'undefined' && !hasHydrated) {
      const detectedLang = detectUserLanguage();
      setHasHydrated(true);
      if (detectedLang !== locale) {
        setLocale(detectedLang);
      }
    }
  }, [hasHydrated, locale]);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('preferredLanguage', locale);
    }
  }, [locale]);

  const t = (key) => {
    // Get translation from loaded translations
    let translation = translations[key];
    
    // If no translation found, console.warn and return key
    if (!translation) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[TRANSLATION MISSING] Missing key: "${key}" - returning key itself`);
      }
      return key;
    }
    
    return translation;
  };


  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isLoadingTranslations }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    // Return default values for SSR compatibility
    return {
      t: (key) => key, // Return the key as fallback
      locale: 'es',
      setLocale: () => {}
    };
  }
  return { t: context.t, locale: context.locale, setLocale: context.setLocale };
}
