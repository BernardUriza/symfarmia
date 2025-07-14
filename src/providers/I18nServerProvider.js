import { I18nProvider } from "./I18nProvider";

const translationFiles = [
  "common",
  "clinical",
  "orders",
  "navigation",
  "conversation",
  "status",
  "landing",
  "dashboard",
  "workflow",
  "demo",
  "dialogue",
  "transcription",
  "language_switcher",
  "ui",
  "errors",
];

function flattenObject(obj, prefix = "") {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      Object.assign(acc, flattenObject(obj[key], newKey));
    } else {
      acc[newKey] = obj[key];
    }
    return acc;
  }, {});
}

async function loadServerTranslations(locale) {
  const modules = await Promise.all(
    translationFiles.map((file) =>
      import(`../../locales/${locale}/${file}.json`)
    )
  );
  const translations = {};
  modules.forEach((mod) => {
    Object.assign(translations, flattenObject(mod.default || mod));
  });
  return translations;
}

export default async function I18nServerProvider({ children }) {
  const locale = "es";
  let translations = {};
  try {
    translations = await loadServerTranslations(locale);
  } catch (e) {
    console.error("Failed to preload translations", e);
  }
  return (
    <I18nProvider initialLocale={locale} initialTranslations={translations}>
      {children}
    </I18nProvider>
  );
}
