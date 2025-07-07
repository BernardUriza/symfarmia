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
    'inventar_consulta': 'Inventar Consulta',
    
    // Consultation workspace
    'consultation_title': 'Consulta Médica',
    'session_active': 'Sesión activa',
    'session_inactive': 'Sesión inactiva',
    'activate_advanced_ai': 'Activar IA Avanzada',
    'basic_mode': 'Modo Básico',
    'change_layout': 'Cambiar diseño',
    
    // Consultation settings
    'consultation_settings': 'Configuración de Consulta',
    'customize_experience': 'Personaliza tu experiencia médica',
    'save_settings': 'Guardar Configuración',
    'reset': 'Resetear',
    
    // Landing page critical content
    'intelligent_transcription': 'Transcripción Inteligente',
    'intelligent_transcription_desc': 'Convierte automáticamente el audio de la consulta en texto médico estructurado',
    'assisted_diagnosis': 'Diagnóstico Asistido',
    'assisted_diagnosis_desc': 'Sugiere diagnósticos posibles basados en síntomas y análisis clínico',
    'transformation_voices': 'Voces de la Transformación',
    'real_doctor_stories': 'Historias reales de médicos que ya transformaron su práctica',
    'collective_transformation': 'Más de 500 médicos han reducido su tiempo en documentación en un 70%',
    'join_transformation': 'Únete a la transformación digital médica',
    
    // Landing page missing keys
    'beta_free': 'Acceso beta gratuito • Sin compromiso',
    'demo_interactive': '🎯 Prueba el Demo Interactivo',
    'benefit_speak': 'Habla naturalmente',
    'benefit_speak_desc': 'Realiza tu consulta como siempre. Nuestro sistema escucha y entiende el contexto médico.',
    'benefit_processing': 'Procesamiento inteligente',
    'benefit_processing_desc': 'IA médica especializada estructura automáticamente la información en formato clínico.',
    'benefit_report': 'Reporte instantáneo',
    'benefit_report_desc': 'Obtén un PDF con diagnóstico, tratamiento y recomendaciones listo para entregar.',
    'how_it_works': 'Así de simple funciona',
    'step_consult': 'Consulta normal',
    'step_consult_desc': '"Paciente de 45 años con dolor torácico intermitente..."',
    'step_processing': 'Procesamiento IA',
    'step_processing_desc': 'Sistema analiza y estructura la información médica',
    'step_report': 'Reporte listo',
    'step_report_desc': 'PDF con diagnóstico, tratamiento y seguimiento',
    'testimonial_author': 'Dr. María González',
    'testimonial_position': 'Medicina Interna, CDMX',
    'testimonial_quote': '"Antes tardaba 15 minutos escribiendo cada reporte. Ahora me concentro en el paciente y el sistema hace el resto. Es exactamente lo que necesitaba."',
    'testimonial_savings': 'Ahorra 2 horas diarias',
    'final_cta_heading': '¿Listo para recuperar tu tiempo?',
    'final_cta_text': 'Únete al beta para descubrir cómo la IA puede simplificar tu práctica médica.',
    'final_cta_signup': 'Solicita acceso beta',
    'final_cta_demo': 'O revisa el demo',
    'footer_copy': '© 2024 SYMFARMIA • Hecho con 💙 para médicos en México',
    'footer_privacy': 'Privacidad',
    'footer_terms': 'Términos',
    'footer_contact': 'Contacto',
    
    // Common testimonial fallbacks
    'dr_maria_name': 'Dra. María González',
    'dr_maria_specialty': 'Medicina General',
    'dr_maria_location': 'Ciudad de México',
    'dr_carlos_name': 'Dr. Carlos Ruiz',
    'dr_carlos_specialty': 'Cardiología',
    'dr_carlos_location': 'Barcelona',
    'dr_ana_name': 'Dra. Ana López',
    'dr_ana_specialty': 'Pediatría',
    'dr_ana_location': 'Buenos Aires',
    
    // Landing page feature cards - BRUTAL FIX for hardcoded English
    'Patient Management': 'Gestión de Pacientes',
    'Medical Reports': 'Reportes Médicos', 
    'Analytics': 'Análisis',
    'Complete patient profiles and medical history tracking': 'Perfiles completos de pacientes y seguimiento de historial médico',
    'Digital diagnosis tracking and documentation': 'Seguimiento y documentación digital de diagnósticos',
    'Intelligent insights for medical practice': 'Información inteligente para la práctica médica',
    'Welcome to SYMFARMIA': 'Bienvenido a SYMFARMIA',
    'Modern medical practice management with intelligent automation': 'Gestión moderna de consultorios médicos con automatización inteligente',
    'Login': 'Iniciar Sesión',
    'Register': 'Registrarse',
    'Get Started': 'Comenzar',
    'Try Demo': 'Probar Demo'
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
    'cta_save_time': 'Yes, save me time',
    
    // Landing page missing keys
    'beta_free': 'Free beta access • No commitment',
    'demo_interactive': '🎯 Try the Interactive Demo',
    'benefit_speak': 'Speak naturally',
    'benefit_speak_desc': 'Conduct your visit as usual. Our system listens and understands the medical context.',
    'benefit_processing': 'Smart processing',
    'benefit_processing_desc': 'Specialized medical AI automatically structures the information into clinical format.',
    'benefit_report': 'Instant report',
    'benefit_report_desc': 'Get a PDF with diagnosis, treatment and recommendations ready to hand over.',
    'how_it_works': 'It\'s that simple',
    'step_consult': 'Normal consultation',
    'step_consult_desc': '"45 year old patient with intermittent chest pain..."',
    'step_processing': 'AI processing',
    'step_processing_desc': 'System analyzes and structures the medical information',
    'step_report': 'Report ready',
    'step_report_desc': 'PDF with diagnosis, treatment and follow-up',
    'testimonial_author': 'Dr. María González',
    'testimonial_position': 'Internal Medicine, Mexico City',
    'testimonial_quote': '"I used to spend 15 minutes writing each report. Now I focus on the patient and the system does the rest. It\'s exactly what I needed."',
    'testimonial_savings': 'Saves 2 hours daily',
    'final_cta_heading': 'Ready to get your time back?',
    'final_cta_text': 'Join the beta to see how AI can simplify your medical practice.',
    'final_cta_signup': 'Request beta access',
    'final_cta_demo': 'Or check out the demo',
    'footer_copy': '© 2024 SYMFARMIA • Made with 💙 for doctors in Mexico',
    'footer_privacy': 'Privacy',
    'footer_terms': 'Terms',
    'footer_contact': 'Contact'
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
      'Warning': 'Advertencia',
      // Landing page brutal fixes
      'Patient Management': 'Gestión de Pacientes',
      'Medical Reports': 'Reportes Médicos',
      'Welcome to SYMFARMIA': 'Bienvenido a SYMFARMIA',
      'Get Started': 'Comenzar',
      'Try Demo': 'Probar Demo',
      // Session status
      'consultation_title': 'Consulta Médica',
      'session_active': 'Sesión activa',
      'basic_mode': 'Modo Básico'
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
