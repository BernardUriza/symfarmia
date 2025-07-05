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
    'demo_login': 'Acceso Demo',
    'auto_fill_demo': 'Observa cómo llenamos automáticamente las credenciales de demostración',
    'email': 'Email',
    'password': 'Contraseña',
    'login_demo': 'Acceder al Demo',
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
    'finding_hope_again': 'Encontrando esperanza nuevamente'
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
    'demo_login': 'Demo Login',
    'auto_fill_demo': 'Watch as we automatically fill in demo credentials',
    'email': 'Email',
    'password': 'Password',
    'login_demo': 'Login to Demo',
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
    'finding_hope_again': 'Finding hope again'
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
  const [locale, setLocale] = useState(() => {
    if (typeof window === 'undefined') return 'es';
    return detectUserLanguage();
  });

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
