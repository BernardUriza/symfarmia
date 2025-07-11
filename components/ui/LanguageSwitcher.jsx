/**
 * REVOLUTIONARY LANGUAGE SWITCHER COMPONENT
 * 
 * Visible UI component for language switching across all screens
 * Features:
 * - Modern, accessible design
 * - Smooth animations
 * - Mobile-friendly
 * - Keyboard navigation support
 * - Visual feedback
 * - Medical context awareness
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { GlobeAltIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '@/app/providers/I18nProvider';

// 🌍 SUPPORTED LANGUAGES
const SUPPORTED_LANGUAGES = [
  {
    code: 'es',
    name: 'Español',
    nativeName: 'Español',
    flag: '🇪🇸',
    country: 'España',
    medical: true
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    country: 'United States',
    medical: true
  }
];

// 🎨 SWITCHER STYLES
const SWITCHER_STYLES = {
  // Compact style for headers/navigation
  compact: {
    container: 'relative inline-flex items-center',
    button: 'flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200',
    dropdown: 'absolute right-0 z-50 mt-2 w-48 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
    item: 'flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer transition-colors duration-150'
  },
  
  // Full style for settings/preferences
  full: {
    container: 'w-full max-w-md',
    button: 'w-full flex items-center justify-between px-4 py-3 text-left text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200',
    dropdown: 'absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
    item: 'flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 cursor-pointer transition-colors duration-150'
  },
  
  // Floating style for overlay/quick access
  floating: {
    container: 'fixed bottom-4 right-4 z-50',
    button: 'flex items-center px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105',
    dropdown: 'absolute bottom-full right-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none',
    item: 'flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 cursor-pointer transition-colors duration-150'
  }
};

// 🎯 LANGUAGE SWITCHER COMPONENT
const LanguageSwitcher = ({ 
  style = 'compact', 
  showFlag = true, 
  showCountry = false,
  showMedicalIndicator = false,
  className = ''
}) => {
  const { locale, setLocale, } = useI18n();
  const { t } = useTranslation('language_switcher');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  
  // Find current language
  useEffect(() => {
    const current = SUPPORTED_LANGUAGES.find(lang => lang.code === locale);
    setSelectedLanguage(current || SUPPORTED_LANGUAGES[0]);
  }, [locale]);
  
  // Handle language change
  const handleLanguageChange = (languageCode) => {
    setLocale(languageCode);
    setIsOpen(false);
    
    // Announce change for accessibility (only in browser)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
        const announcement = `Language changed to ${currentLang?.name}`;
        const utterance = new SpeechSynthesisUtterance(announcement);
        utterance.volume = 0.1;
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.warn('Speech synthesis failed:', error);
      }
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('[data-language-switcher]')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  
  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };
  
  // Get styles for current style variant
  const styles = SWITCHER_STYLES[style] || SWITCHER_STYLES.compact;
  
  if (!selectedLanguage) {
    return null;
  }
  
  return (
    <div 
      className={`${styles.container} ${className}`}
      data-language-switcher
      onKeyDown={handleKeyDown}
    >
      {/* Language Button */}
      <button
        type="button"
        className={styles.button}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t('language_switcher.switcher')}
      >
        {/* Globe Icon */}
        <GlobeAltIcon className="w-4 h-4 mr-2 text-gray-500" />
        
        {/* Flag */}
        {showFlag && (
          <span className="mr-2 text-lg" role="img" aria-label={selectedLanguage.country}>
            {selectedLanguage.flag}
          </span>
        )}
        
        {/* Language Name */}
        <span className="font-medium">
          {style === 'compact' ? selectedLanguage.code.toUpperCase() : selectedLanguage.name}
        </span>
        
        {/* Medical Indicator */}
        {showMedicalIndicator && selectedLanguage.medical && (
          <span className="ml-2 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
            {t('language_switcher.medical_certified')}
          </span>
        )}
        
        {/* Dropdown Icon */}
        <ChevronDownIcon 
          className={`w-4 h-4 ml-2 text-gray-500 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className={styles.dropdown}>
          <div className="py-1" role="menu" aria-orientation="vertical">
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.code}
                type="button"
                className={`${styles.item} ${
                  selectedLanguage.code === language.code ? 'bg-blue-50 text-blue-900' : ''
                }`}
                role="menuitem"
                onClick={() => handleLanguageChange(language.code)}
                aria-label={`Change language to ${language.name}`}
              >
                <div className="flex items-center">
                  {/* Flag */}
                  {showFlag && (
                    <span className="mr-3 text-lg" role="img" aria-label={language.country}>
                      {language.flag}
                    </span>
                  )}
                  
                  <div className="flex-1">
                    {/* Language Name */}
                    <div className="font-medium">{language.name}</div>
                    
                    {/* Native Name */}
                    {language.name !== language.nativeName && (
                      <div className="text-xs text-gray-500">{language.nativeName}</div>
                    )}
                    
                    {/* Country */}
                    {showCountry && (
                      <div className="text-xs text-gray-500">{language.country}</div>
                    )}
                  </div>
                  
                  {/* Medical Indicator */}
                  {showMedicalIndicator && language.medical && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      {t('language_switcher.medical')}
                    </span>
                  )}
                </div>
                
                {/* Selected Indicator */}
                {selectedLanguage.code === language.code && (
                  <CheckIcon className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {t('language_switcher.medical_grade')}
              </span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-500">
                  {t('language_switcher.validated')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 🎯 FLOATING LANGUAGE SWITCHER
export const FloatingLanguageSwitcher = ({ className = '' }) => {
  return (
    <LanguageSwitcher 
      style="floating"
      showFlag={true}
      showMedicalIndicator={true}
      className={className}
    />
  );
};

// 🎯 COMPACT LANGUAGE SWITCHER
export const CompactLanguageSwitcher = ({ className = '' }) => {
  return (
    <LanguageSwitcher 
      style="compact"
      showFlag={true}
      className={className}
    />
  );
};

// 🎯 FULL LANGUAGE SWITCHER
export const FullLanguageSwitcher = ({ className = '' }) => {
  return (
    <LanguageSwitcher 
      style="full"
      showFlag={true}
      showCountry={true}
      showMedicalIndicator={true}
      className={className}
    />
  );
};

// 🎯 MEDICAL LANGUAGE SWITCHER
export const MedicalLanguageSwitcher = ({ className = '', style = 'compact' }) => {
  return (
    <div className={`${className} relative`}>
      <LanguageSwitcher 
        style={style}
        showFlag={true}
        showMedicalIndicator={true}
        className="border-2 border-green-200 bg-green-50"
      />
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
        <span className="text-xs text-white font-bold">✓</span>
      </div>
    </div>
  );
};

export default LanguageSwitcher;