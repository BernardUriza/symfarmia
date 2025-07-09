module.exports = {
  i18n: {
    defaultLocale: 'es',
    locales: ['en', 'es'],
    localeDetection: true,
  },
  // Disable fallback behavior and throw on missing keys to catch issues early
  fallbackLng: false,
  saveMissing: false,
  missingKeyHandler: (lng, ns, key) => {
    throw new Error(
      `Missing translation key "${key}" in namespace "${ns}" for language "${lng}"`
    );
  },
};
