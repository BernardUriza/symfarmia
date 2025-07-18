import React from 'react';
import { useTranslation } from '@/src/providers/I18nProvider';

interface TranslationGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showDefault?: boolean; // If true, shows children even while loading
}

/**
 * TranslationGuard prevents rendering children until translations are loaded
 * to avoid race conditions and "MISSING TRANSLATION" warnings
 */
export const TranslationGuard: React.FC<TranslationGuardProps> = ({ 
  children, 
  fallback,
  showDefault = false 
}) => {
  const { isLoadingTranslations } = useTranslation();

  if (isLoadingTranslations && !showDefault) {
    return (
      <>
        {fallback || (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
};

/**
 * Hook to check if translations are ready
 */
export const useTranslationsReady = () => {
  const { isLoadingTranslations, translations } = useTranslation();
  return !isLoadingTranslations && Object.keys(translations || {}).length > 0;
};