"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation as nextUseTranslation, i18n } from 'next-i18next';
import { detectUserLanguage } from '../../utils/detectUserLanguage';

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(detectUserLanguage());

  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('preferredLanguage', locale);
    }
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation(ns) {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  const translation = nextUseTranslation(ns);
  return { t: translation.t, locale: context.locale, setLocale: context.setLocale };
}
