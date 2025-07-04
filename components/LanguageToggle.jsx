"use client";
import { useTranslation } from '../app/providers/I18nProvider';

export default function LanguageToggle({ className = '' }) {
  const { locale, setLocale } = useTranslation();
  const toggle = () => setLocale(locale === 'en' ? 'es' : 'en');
  return (
    <button
      onClick={toggle}
      className={`ml-2 px-2 py-1 border rounded text-sm ${className}`}
    >
      {locale === 'en' ? 'ES' : 'EN'}
    </button>
  );
}
