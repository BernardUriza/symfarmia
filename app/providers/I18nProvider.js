"use client";
import { createContext, useContext, useEffect, useState } from 'react';

const I18nContext = createContext();

// Mock translations for build fix
const translations = {
  'es': {
    'ai_assistant_welcome': 'Hola! Soy tu Asistente de IA médica. Puedo ayudarte a analizar datos de pacientes, identificar tendencias y proporcionar información clínica.',
    'ai_assistant': 'Asistente IA',
    'powered_by_ai': 'Powered by AI',
    'ask_medical_question': 'Haz una pregunta médica...',
    'online': 'En línea',
    'demographics': 'Demografía',
    'outcomes': 'Resultados',
    'revenue': 'Ingresos',
    'welcome_to': 'Bienvenido a',
    'tagline': 'Plataforma inteligente para médicos independientes',
    'patient_management': 'Patient Management',
    'medical_reports': 'Medical Reports',
    'analytics': 'Analytics',
    'demo_login': 'Acceso Demo',
    'auto_fill_demo': 'Observa cómo llenamos automáticamente las credenciales de demostración',
    'email': 'Email',
    'password': 'Contraseña',
    'login_demo': 'Acceder al Demo',
    'try_demo': 'Probar modo demo',
    'login': 'Iniciar sesión',
    'register': 'Registrarse',
    'demo_mode_full_access': 'El modo demo proporciona acceso completo con datos de muestra',
    'demo_mode_active': 'Modo Demo Activo',
    'demo_mode_desc': 'Explora todas las funcionalidades con datos de ejemplo',
    'switch_live_mode': 'Cambiar a Modo Live',
    'exit_demo': 'Salir del Demo',
    'medical_crisis': 'Crisis Médica',
    'medical_time_lost': 'Tiempo perdido en documentación',
    'burnout_rate': 'Tasa de burnout médico',
    'annual_inefficiency': 'Ineficiencia anual',
    'human_contact_crisis': 'Crisis de contacto humano',
    'finding_hope_again': 'Encontrando esperanza nuevamente',

    // Minimalist landing page
    'hero_heading': 'Convierte consultas médicas en reportes clínicos automáticamente',
    'hero_subheading': 'Habla durante tu consulta y obtén un reporte médico estructurado en segundos. Sin interrupciones, sin formularios, sin perder tiempo.',
    'cta_save_time': 'Quiero ahorrar tiempo',
    'cta_sending': 'Enviando...',
    'beta_free': 'Acceso beta gratuito • Sin compromiso',
    'demo_interactive': '🎯 Prueba el Demo Interactivo',
    'demo_welcome': '¡Bienvenido al Demo de SYMFARMIA!',
    'demo_explore_features': 'Explora todas las funcionalidades con datos de ejemplo',
    'contact_soon': '¡Perfecto! Te contactaremos pronto',
    'check_email': 'Revisa tu email para los próximos pasos',
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
    'final_cta_text': 'Únete al beta y descubre cómo la IA puede simplificar tu práctica médica.',
    'final_cta_signup': 'Solicita acceso beta',
    'final_cta_demo': 'O prueba el demo',
    'footer_copy': '© 2024 SYMFARMIA • Hecho con 💙 para médicos en México',
    'footer_privacy': 'Privacidad',
    'footer_terms': 'Términos',
    'footer_contact': 'Contacto',

    // Consultation workspace
    'consultation_title': 'Consulta Médica',
    'session_active': 'Sesión activa',
    'session_inactive': 'Sesión inactiva',
    'activate_advanced_ai': 'Activar IA Avanzada',
    'basic_mode': 'Modo Básico',
    'change_layout': 'Cambiar disposición',
    
    // Language abbreviations
    'english_abbr': 'EN',
    'spanish_abbr': 'ES'
  },
  'en': {
    'ai_assistant_welcome': 'Hello! I\'m your AI Medical Analytics Assistant. I can help you analyze patient data, identify trends, and provide clinical insights.',
    'ai_assistant': 'AI Assistant',
    'powered_by_ai': 'Powered by AI',
    'ask_medical_question': 'Ask a medical question...',
    'online': 'Online',
    'demographics': 'Demographics',
    'outcomes': 'Outcomes',
    'revenue': 'Revenue',
    'welcome_to': 'Welcome to',
    'tagline': 'Intelligent platform for independent doctors',
    'patient_management': 'Patient Management',
    'medical_reports': 'Medical Reports',
    'analytics': 'Analytics',
    'demo_login': 'Demo Login',
    'auto_fill_demo': 'Watch as we automatically fill in demo credentials',
    'email': 'Email',
    'password': 'Password',
    'login_demo': 'Login to Demo',
    'try_demo': 'Try Demo Mode',
    'login': 'Login',
    'register': 'Register',
    'demo_mode_full_access': 'Demo mode provides full access with sample data',
    'demo_mode_active': 'Demo Mode Active',
    'demo_mode_desc': 'Explore all features with sample data',
    'switch_live_mode': 'Switch to Live Mode',
    'exit_demo': 'Exit Demo',
    'medical_crisis': 'Medical Crisis',
    'medical_time_lost': 'Time lost in documentation',
    'burnout_rate': 'Medical burnout rate',
    'annual_inefficiency': 'Annual inefficiency',
    'human_contact_crisis': 'Human contact crisis',
    'finding_hope_again': 'Finding hope again',

    // Minimalist landing page
    'hero_heading': 'Turn medical visits into clinical reports automatically',
    'hero_subheading': 'Speak during your visit and get a structured medical report in seconds. No interruptions, no forms, no wasted time.',
    'cta_save_time': 'I want to save time',
    'cta_sending': 'Sending...',
    'beta_free': 'Free beta access • No commitment',
    'demo_interactive': '🎯 Try the Interactive Demo',
    'demo_welcome': 'Welcome to the SYMFARMIA Demo!',
    'demo_explore_features': 'Explore all features with sample data',
    'contact_soon': 'Great! We will contact you soon',
    'check_email': 'Check your email for next steps',
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
    'final_cta_text': 'Join the beta and see how AI can simplify your medical practice.',
    'final_cta_signup': 'Request beta access',
    'final_cta_demo': 'Or try the demo',
    'footer_copy': '© 2024 SYMFARMIA • Made with 💙 for doctors in Mexico',
    'footer_privacy': 'Privacy',
    'footer_terms': 'Terms',
    'footer_contact': 'Contact',

    // Consultation workspace
    'consultation_title': 'Medical Consultation',
    'session_active': 'Session active',
    'session_inactive': 'Session inactive',
    'activate_advanced_ai': 'Enable Advanced AI',
    'basic_mode': 'Basic Mode',
    'change_layout': 'Change layout',
    
    // Language abbreviations
    'english_abbr': 'EN',
    'spanish_abbr': 'ES'
  }
};

function detectUserLanguage() {
  if (typeof window === 'undefined') return 'es';
  
  // Check localStorage first
  const stored = localStorage.getItem('preferredLanguage');
  if (stored && translations[stored]) return stored;
  
  // Check browser language
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('en')) return 'en';
  
  return 'es'; // Default to Spanish
}

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState('es'); // Always start with 'es' for consistent SSR

  useEffect(() => {
    // Only run on client side - detect and set user language after hydration
    if (typeof window !== 'undefined') {
      const detectedLang = detectUserLanguage();
      if (detectedLang !== locale) {
        setLocale(detectedLang);
      }
    }
  }, [locale]);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('preferredLanguage', locale);
    }
  }, [locale]);

  const t = (key) => {
    return translations[locale]?.[key] || translations['es']?.[key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
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
