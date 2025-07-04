"use client";
import { createContext, useContext, useState } from 'react';
import en from '../../locales/en.json';
import es from '../../locales/es.json';

const resources = { en, es };

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState('en');
  const t = (key) => {
    const dict = resources[locale] || {};
    return dict[key] || key;
  };
  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return { t: context.t, locale: context.locale, setLocale: context.setLocale };
}
