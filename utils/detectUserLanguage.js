export function detectUserLanguage() {
  // TODO: Implement IP-based detection
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language.slice(0, 2).toLowerCase();
    if (['en', 'es'].includes(browserLang)) {
      return browserLang;
    }
  }
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('preferredLanguage');
    if (saved && ['en', 'es'].includes(saved)) {
      return saved;
    }
  }
  return 'es';
}
