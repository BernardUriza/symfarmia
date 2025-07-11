/**
 * REVOLUTIONARY I18N HOOK
 * 
 * Custom hook that works with both existing and revolutionary i18n systems
 * Provides seamless language switching functionality
 */

'use client';

import { useContext, useEffect, useState } from 'react';
import { I18nContext } from '../app/providers/I18nProvider';


// 🔄 PARAMETER SUBSTITUTION
const substituteParameters = (text, params = {}) => {
  if (!text || typeof text !== 'string') return text;
  
  return text.replace(/\{(\w+)\}/g, (match, param) => {
    return params[param] !== undefined ? params[param] : match;
  });
};

// 🎯 MAIN I18N HOOK
export const useI18n = () => {
  const context = useContext(I18nContext);
  
  if (!context) {
    // Fallback implementation when provider is not available
    const fallbackSetLocale = (locale) => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('preferredLanguage', locale);
        } catch (error) {
          console.warn('Could not save language preference:', error);
        }
      }
    };
    
    return {
      locale: 'es',
      setLocale: fallbackSetLocale,
      t: (key, params = {}) => {
        return substituteParameters(key, params);
      },
      isLoading: false
    };
  }
  
  const { locale, setLocale, translations: ctxTranslations, isLoading } = context;

  const [demoTranslations, setDemoTranslations] = useState({});

  useEffect(() => {
    import(`../locales/${locale}/demo.json`)
      .then(mod => {
        const data = mod.default?.demo || mod.default || {};
        setDemoTranslations(Object.keys(data).reduce((acc, key) => {
          acc[`demo.${key}`] = data[key];
          return acc;
        }, {}));
      })
      .catch(() => {
        setDemoTranslations({});
      });
  }, [locale]);

  const translations = { ...demoTranslations, ...ctxTranslations };
  
  // Enhanced translation function
  const t = (key, params = {}) => {
    try {
      // Validate that translations are loaded
      if (!translations) {
        console.error('Translations not loaded');
        return key;
      }
      
      // Get translation from main translations
      let translation = translations[key];
      
      // If not found, log warning and return readable fallback
      if (!translation) {
        console.warn(`Missing translation key: ${key}`);
        // Return a readable fallback text for medical professionals
        const fallbackText = key.split('.').pop().replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
        return fallbackText.charAt(0).toUpperCase() + fallbackText.slice(1);
      }
      
      // Apply parameter substitution
      if (params && typeof translation === 'string') {
        translation = substituteParameters(translation, params);
      }
      
      return translation;
      
    } catch (error) {
      console.error(`Translation error for key "${key}":`, error);
      return key; // Return key as fallback
    }
  };
  
  return {
    locale,
    setLocale,
    t,
    isLoading,
    translations
  };
};


export default useI18n;