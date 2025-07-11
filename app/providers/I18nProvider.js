"use client";
import { createContext, useContext, useEffect, useState } from 'react';

export const I18nContext = createContext();

// Professional JSON-only translations loader
async function loadTranslations(locale) {
  try {
    const modules = await Promise.all([
      import(`../../locales/${locale}/common.json`),
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
      import(`../../locales/${locale}/ui.json`),
      import(`../../locales/${locale}/errors.json`),
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

    return combinedTranslations;
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error);
    throw new Error(`Translation loading failed for locale: ${locale}`);
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
  const [loadError, setLoadError] = useState(null);

  // Load translations when locale changes
  useEffect(() => {
    async function loadAndSetTranslations() {
      setIsLoadingTranslations(true);
      setLoadError(null);
      
      try {
        const loadedTranslations = await loadTranslations(locale);
        setTranslations(loadedTranslations);
      } catch (error) {
        setLoadError(error);
        console.error('Translation loading error:', error);
      } finally {
        setIsLoadingTranslations(false);
      }
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
    if (isLoadingTranslations) return key; // Show key while loading
    if (loadError) return `[ERROR:${key}]`; // Clear error indication
    
    const translation = translations[key];
    if (!translation) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key}`);
      }
      return `[MISSING:${key}]`; // Clear missing key indication
    }
    
    return translation;
  };

  if (loadError) {
    // Show proper error UI instead of crashing
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-red-800 font-bold">Translation System Error</h2>
        <p className="text-red-600">
          Failed to load translations for locale: {locale}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
        >
          Refresh Page
        </button>
      </div>
    );
  }

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
      t: (key) => `[SSR:${key}]`, // Clear SSR indication
      locale: 'es',
      setLocale: () => {},
      isLoadingTranslations: false
    };
  }
  return { 
    t: context.t, 
    locale: context.locale, 
    setLocale: context.setLocale,
    isLoadingTranslations: context.isLoadingTranslations 
  };
}
