type SupportedLanguage = 'en' | 'es';

export function detectUserLanguage(): SupportedLanguage {
  // TODO: Implement IP-based detection
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language.slice(0, 2).toLowerCase();
    if (['en', 'es'].includes(browserLang)) {
      return browserLang as SupportedLanguage;
    }
  }
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('preferredLanguage');
    if (saved && ['en', 'es'].includes(saved)) {
      return saved as SupportedLanguage;
    }
  }
  return 'es';
}