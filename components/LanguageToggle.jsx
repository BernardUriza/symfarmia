"use client";
import { useTranslation } from '../app/providers/I18nProvider';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

export default function LanguageToggle({ className = '', variant = 'default' }) {
  const { locale, setLocale, t } = useTranslation();
  const toggle = () => setLocale(locale === 'en' ? 'es' : 'en');
  
  if (variant === 'prominent') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <GlobeAltIcon className="w-5 h-5 text-blue-600" />
        <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
          <button
            onClick={() => setLocale('en')}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              locale === 'en' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLocale('es')}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              locale === 'es' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Español
          </button>
        </div>
      </div>
    );
  }
  
  if (variant === 'medical') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm font-medium text-gray-600">{t('clinical_language')}:</span>
        <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setLocale('en')}
            className={`px-3 py-1.5 text-sm font-semibold transition-all duration-200 ${
              locale === 'en' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-blue-700 hover:bg-blue-100'
            }`}
          >
            EN
          </button>
          <div className="w-px h-6 bg-blue-200"></div>
          <button
            onClick={() => setLocale('es')}
            className={`px-3 py-1.5 text-sm font-semibold transition-all duration-200 ${
              locale === 'es' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-blue-700 hover:bg-blue-100'
            }`}
          >
            ES
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <button
      onClick={toggle}
      className={`ml-2 px-2 py-1 border rounded text-sm ${className}`}
    >
      {locale === 'en' ? 'ES' : 'EN'}
    </button>
  );
}
