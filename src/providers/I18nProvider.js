"use client";
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

export const I18nContext = createContext();

// Professional JSON-only translations loader with retry mechanism
async function loadTranslations(locale, retryCount = 0) {
  const maxRetries = 3;
  const retryDelay = 1000 * Math.pow(2, retryCount); // Exponential backoff
  
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
    
    // Validate that all modules loaded correctly
    const failedModules = [];
    modules.forEach((module, index) => {
      if (!module || (!module.default && !module)) {
        failedModules.push(index);
      }
    });
    
    if (failedModules.length > 0) {
      throw new Error(`Failed to load ${failedModules.length} translation modules`);
    }
    
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
    modules.forEach((module, index) => {
      try {
        Object.assign(combinedTranslations, flattenObject(module.default || module));
      } catch (flattenError) {
        console.error(`Error flattening module ${index}:`, flattenError);
        throw new Error(`Translation processing failed for module ${index}`);
      }
    });

    // Validate that we have translations
    if (Object.keys(combinedTranslations).length === 0) {
      throw new Error('No translations loaded');
    }

    return combinedTranslations;
  } catch (error) {
    console.error(`Failed to load translations for ${locale} (attempt ${retryCount + 1}):`, error);
    
    // Retry logic
    if (retryCount < maxRetries) {
      console.log(`Retrying translation load in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return loadTranslations(locale, retryCount + 1);
    }
    
    throw new Error(`Translation loading failed for locale: ${locale} after ${maxRetries + 1} attempts`);
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
  const [retryCount, setRetryCount] = useState(0);
  const loadingRef = useRef(false);

  // Robust translation loading with error recovery
  const loadAndSetTranslations = useCallback(async (targetLocale, isRetry = false) => {
    // Prevent multiple simultaneous loads
    if (loadingRef.current && !isRetry) {
      return;
    }
    
    loadingRef.current = true;
    setIsLoadingTranslations(true);
    setLoadError(null);
    
    try {
      const loadedTranslations = await loadTranslations(targetLocale);
      
      // Validate translations before setting
      if (!loadedTranslations || Object.keys(loadedTranslations).length === 0) {
        throw new Error('Empty translations received');
      }
      
      setTranslations(loadedTranslations);
      setRetryCount(0);
      
      // Log successful load for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Translations loaded successfully for ${targetLocale}: ${Object.keys(loadedTranslations).length} keys`);
      }
      
    } catch (error) {
      setLoadError(error);
      setRetryCount(prev => prev + 1);
      
      console.error('Translation loading error:', error);
      
      // Fallback to Spanish if loading English fails
      if (targetLocale === 'en' && !isRetry) {
        console.log('Falling back to Spanish translations...');
        try {
          const spanishTranslations = await loadTranslations('es');
          setTranslations(spanishTranslations);
          setLocale('es');
          setLoadError(null);
        } catch (spanishError) {
          console.error('Spanish fallback also failed:', spanishError);
        }
      }
    } finally {
      setIsLoadingTranslations(false);
      loadingRef.current = false;
    }
  }, []);

  // Load translations when locale changes
  useEffect(() => {
    loadAndSetTranslations(locale);
  }, [locale, loadAndSetTranslations]);

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

  // Enhanced error boundary with retry functionality
  const handleRetry = useCallback(() => {
    setLoadError(null);
    setRetryCount(0);
    loadAndSetTranslations(locale, true);
  }, [locale, loadAndSetTranslations]);

  const handleFallbackToSpanish = useCallback(() => {
    setLoadError(null);
    setRetryCount(0);
    setLocale('es');
  }, []);

  if (loadError) {
    // Show comprehensive error UI with recovery options
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white border border-red-200 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">🚨</div>
            <h2 className="text-xl font-bold text-red-800 mb-2">Translation System Error</h2>
            <p className="text-red-600 mb-4">
              Failed to load translations for locale: <strong>{locale}</strong>
            </p>
            
            <div className="text-sm text-gray-600 mb-4">
              <p>Retry attempts: {retryCount}</p>
              <p>Error: {loadError.message}</p>
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={handleRetry}
                disabled={isLoadingTranslations}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
              >
                {isLoadingTranslations ? 'Retrying...' : 'Retry Loading'}
              </button>
              
              {locale !== 'es' && (
                <button 
                  onClick={handleFallbackToSpanish}
                  disabled={isLoadingTranslations}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
                >
                  Switch to Spanish
                </button>
              )}
              
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
              >
                Refresh Page
              </button>
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              <p>If this problem persists, please contact support.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <I18nContext.Provider value={{ 
      locale, 
      setLocale, 
      t, 
      isLoadingTranslations,
      translations,
      loadError,
      retryCount,
      handleRetry
    }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    // Return default values for SSR compatibility
    return {
      t: (key) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Translation context not available for key: ${key}`);
        }
        return key; // Return key instead of SSR indication
      },
      locale: 'es',
      setLocale: () => {},
      isLoadingTranslations: false,
      translations: {},
      loadError: null,
      retryCount: 0,
      handleRetry: () => {}
    };
  }
  
  return { 
    t: context.t, 
    locale: context.locale, 
    setLocale: context.setLocale,
    isLoadingTranslations: context.isLoadingTranslations,
    translations: context.translations,
    loadError: context.loadError,
    retryCount: context.retryCount,
    handleRetry: context.handleRetry
  };
}
