"use client";
import { createContext, useContext, useEffect, useState } from 'react';

const I18nContext = createContext();

// Dynamic translations loader
async function loadTranslations(locale) {
  try {
    const modules = await Promise.all([
      import(`../../locales/${locale}/common.json`),
      import(`../../locales/${locale}/medical.json`),
      import(`../../locales/${locale}/landing.json`),
      import(`../../locales/${locale}/dashboard.json`),
    ]);
    
    // Flatten nested objects for easier access
    const flattenObject = (obj, prefix = '') => {
      return Object.keys(obj).reduce((acc, key) => {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          Object.assign(acc, flattenObject(obj[key], newKey));
        } else {
          acc[newKey] = obj[key];
        }
        return acc;
      }, {});
    };

    const combinedTranslations = {};
    modules.forEach(module => {
      Object.assign(combinedTranslations, flattenObject(module.default || module));
    });

    return combinedTranslations;
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error);
    return fallbackTranslations[locale] || fallbackTranslations['es'];
  }
}

// Fallback translations for critical functionality
const fallbackTranslations = {
  'es': {
    // Core transcription functionality
    'transcription.title': 'Transcripción en Tiempo Real',
    'transcription.ready_to_record': 'Listo para grabar',
    'transcription.start_recording': 'Iniciar Grabación',
    'transcription.stop_recording': 'Detener',
    'transcription.no_transcript_available': 'No hay transcripción disponible',
    'transcription.no_transcript_description': 'Presiona "Iniciar Grabación" para comenzar a transcribir tu consulta médica',
    'transcription.service_label': 'Servicio',
    'transcription.service_browser': 'Navegador',
    'transcription.demo_heading': 'Demo de Transcripción IA',
    'transcription.demo_instructions': 'Presiona "Iniciar Grabación" para ver la magia en acción',
    'transcription.final_transcript': 'Transcripción Final',
    'transcription.words_count': 'palabras',
    'transcription.medical_ai_active': 'IA Médica Activa',
    'transcription.reset_demo': 'Reiniciar Demo',
    
    // Microphone functionality
    'microphone.status.need_access': 'Necesitamos acceso al micrófono para grabar tu consulta',
    'microphone.actions.test_access': 'Probar acceso',
    
    // AI Assistant
    'ai_assistant_welcome': 'Hola! Soy tu Asistente de IA médica. Puedo ayudarte a analizar datos de pacientes, identificar tendencias y proporcionar información clínica.',
    
    // Languages
    'language': 'Idioma',
    'english': 'Inglés',
    'spanish': 'Español',
    'english_abbr': 'EN',
    'spanish_abbr': 'ES',
    
    // Authentication
    'login': 'Iniciar sesión',
    'register': 'Registrarse',
    
    // Landing page
    'hero_heading': 'Herramientas inteligentes para médicos modernos',
    'hero_subheading': 'Ahorra tiempo en papeleo y enfócate en tus pacientes',
    'cta_save_time': 'Sí, quiero ahorrar tiempo',
    
    // Navigation
    'dashboard': 'Panel Principal',
    'patients': 'Pacientes',
    'reports': 'Reportes',
    'consultation': 'Consulta',
    'profile': 'Perfil',
    'settings': 'Configuración',
    
    // Common actions
    'save': 'Guardar',
    'cancel': 'Cancelar',
    'delete': 'Eliminar',
    'edit': 'Editar',
    'create': 'Crear',
    'update': 'Actualizar',
    'search': 'Buscar',
    'loading': 'Cargando',
    'error': 'Error',
    'success': 'Éxito',
    'warning': 'Advertencia',
    'close': 'Cerrar',
    'open': 'Abrir',
    'view': 'Ver',
    'export': 'Exportar',
    'import': 'Importar',
    
    // Medical terminology
    'medical_assistant': 'Asistente Médico',
    'ai_assistant': 'Asistente IA',
    'documentation': 'Documentación',
    'soap_notes': 'Notas SOAP',
    'symptoms': 'Síntomas',
    'diagnosis': 'Diagnóstico',
    'treatment': 'Tratamiento',
    'vital_signs': 'Signos Vitales',
    'clinical_alerts': 'Alertas Clínicas',
    
    // Demo strategies
    'general_medicine': 'Medicina General',
    'cardiology': 'Cardiología',
    'pediatrics': 'Pediatría',
    'quality_of_life': 'Calidad de Vida',
    
    // Status messages
    'active': 'Activo',
    'inactive': 'Inactivo',
    'recording': 'Grabando',
    'stopped': 'Detenido',
    'analyzing': 'Analizando',
    'completed': 'Completado',
    
    // UI Actions
    'inventar_consulta': 'Inventar Consulta'
  },
  'en': {
    'transcription.title': 'Real-time Transcription',
    'transcription.ready_to_record': 'Ready to record',
    'transcription.start_recording': 'Start Recording',
    'transcription.stop_recording': 'Stop',
    'transcription.no_transcript_available': 'No transcript available',
    'transcription.no_transcript_description': 'Press "Start Recording" to begin transcribing your medical consultation',
    'transcription.service_label': 'Service',
    'transcription.service_browser': 'Browser',
    'microphone.status.need_access': 'We need microphone access to record your consultation',
    'microphone.actions.test_access': 'Test access',
    'ai_assistant_welcome': 'Hello! I\'m your AI Medical Analytics Assistant. I can help you analyze patient data, identify trends, and provide clinical insights.',
    'ai_assistant': 'AI Assistant',
    'powered_by_ai': 'Powered by AI',
    'ask_medical_question': 'Ask a medical question...',
    'language': 'Language',
    'english': 'English',
    'spanish': 'Spanish',
    'english_abbr': 'EN',
    'spanish_abbr': 'ES',
    'login': 'Login',
    'register': 'Register',
    'hero_heading': 'Smart tools for modern doctors',
    'hero_subheading': 'Spend less time on paperwork and focus on your patients',
    'cta_save_time': 'Yes, save me time'
  }
};

function detectUserLanguage() {
  if (typeof window === 'undefined') return 'es';
  
  // Check localStorage first
  const stored = localStorage.getItem('preferredLanguage');
  if (stored && ['es', 'en'].includes(stored)) return stored;
  
  // Check browser language
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('en')) return 'en';
  
  return 'es'; // Default to Spanish
}

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState('es'); // Always start with 'es' for consistent SSR
  const [hasHydrated, setHasHydrated] = useState(false);
  const [translations, setTranslations] = useState({});
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(true);

  // Load translations when locale changes
  useEffect(() => {
    async function loadAndSetTranslations() {
      setIsLoadingTranslations(true);
      const loadedTranslations = await loadTranslations(locale);
      setTranslations(loadedTranslations);
      setIsLoadingTranslations(false);
    }
    
    loadAndSetTranslations();
  }, [locale]);

  useEffect(() => {
    // Only run once on client side - detect and set user language after hydration
    if (typeof window !== 'undefined' && !hasHydrated) {
      const detectedLang = detectUserLanguage();
      setHasHydrated(true);
      if (detectedLang !== locale) {
        setLocale(detectedLang);
      }
    }
  }, [hasHydrated, locale]);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('preferredLanguage', locale);
    }
  }, [locale]);

  const t = (key) => {
    // Brutal translation system - NEVER mix languages, ALWAYS fallback to Spanish
    let translation;
    
    if (isLoadingTranslations) {
      translation = fallbackTranslations[locale]?.[key] || fallbackTranslations['es']?.[key];
    } else {
      translation = translations[key] || fallbackTranslations[locale]?.[key] || fallbackTranslations['es']?.[key];
    }
    
    // If no translation found, console.warn and return Spanish fallback or key
    if (!translation || translation === key) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[TRANSLATION BROKEN] Missing key: "${key}" - falling back to Spanish or key itself`);
      }
      
      // Try to create a basic Spanish fallback for common patterns
      const spanishFallback = createSpanishFallback(key);
      return spanishFallback || key;
    }
    
    return translation;
  };

  // Create basic Spanish fallbacks for common English patterns
  const createSpanishFallback = (key) => {
    const englishToSpanish = {
      'Start Recording': 'Iniciar Grabación',
      'Stop Recording': 'Detener Grabación', 
      'Real-time Transcription': 'Transcripción en Tiempo Real',
      'Settings': 'Configuración',
      'Dashboard': 'Panel Principal',
      'Patients': 'Pacientes',
      'Reports': 'Reportes',
      'Analytics': 'Análisis',
      'Consultation': 'Consulta',
      'Profile': 'Perfil',
      'Login': 'Iniciar Sesión',
      'Register': 'Registrarse',
      'Save': 'Guardar',
      'Cancel': 'Cancelar',
      'Delete': 'Eliminar',
      'Edit': 'Editar',
      'Create': 'Crear',
      'Update': 'Actualizar',
      'Search': 'Buscar',
      'Loading': 'Cargando',
      'Error': 'Error',
      'Success': 'Éxito',
      'Warning': 'Advertencia'
    };

    // Direct key lookup
    if (englishToSpanish[key]) {
      return englishToSpanish[key];
    }

    // Pattern matching for common suffixes
    if (key.endsWith('_recording')) {
      return key.replace('_recording', '_grabación');
    }
    if (key.endsWith('_transcription')) {
      return key.replace('_transcription', '_transcripción');
    }
    if (key.startsWith('transcription.')) {
      return key; // Keep transcription keys as-is for now
    }

    return null;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isLoadingTranslations }}>
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
