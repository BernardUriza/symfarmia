/**
 * Demo Transcription Hook - MAGIA PURA SIN AUDIO REAL
 * Sistema modular para diferentes casos médicos simulados
 */

import { useState, useEffect, useRef } from 'react';

// ESTRATEGIAS DE DEMO MODULARES por especialidad
const DEMO_STRATEGIES = {
  'general_medicine': {
    name: 'Medicina General',
    icon: '🩺',
    description: 'Consulta médica estándar con síntomas comunes',
    consultation: [
      'Paciente masculino de 35 años.',
      'Consulta por dolor torácico intermitente.',
      'Episodios de 2-3 minutos, sin relación con ejercicio.',
      'Stress laboral elevado últimas semanas.',
      'Fumador ocasional, 5 cigarrillos por semana.',
      'Sin antecedentes cardiovasculares familiares.',
      'Presión arterial normal en consultas previas.',
      'Solicita evaluación cardiológica.'
    ],
    analysis: [
      'Síntomas sugestivos de dolor atípico',
      'Factores de riesgo: stress, tabaquismo',
      'Probabilidad baja de síndrome coronario',
      'Evaluación integral recomendada'
    ],
    recommendations: [
      'ECG de 12 derivaciones',
      'Análisis básicos: glucosa, colesterol',
      'Manejo del stress laboral',
      'Cesación tabáquica gradual'
    ]
  },
  
  'cardiology': {
    name: 'Cardiología',
    icon: '❤️',
    description: 'Especialidad cardiovascular con énfasis en diagnóstico',
    consultation: [
      'Paciente femenina de 58 años.',
      'Antecedentes de hipertensión arterial.',
      'Episodios de palpitaciones nocturnas.',
      'Disnea de esfuerzo progresiva.',
      'Edema en miembros inferiores.',
      'Dolor precordial irradiado a brazo izquierdo.',
      'Factores de riesgo: obesidad, sedentarismo.',
      'Solicita evaluación cardiológica completa.'
    ],
    analysis: [
      'Síndrome coronario agudo a descartar',
      'Signos de insuficiencia cardíaca',
      'Múltiples factores de riesgo cardiovascular',
      'Evaluación urgente requerida'
    ],
    recommendations: [
      'ECG urgente + troponinas',
      'Ecocardiograma transtorácico',
      'Radiografía de tórax',
      'BNP o NT-proBNP'
    ]
  },
  
  'pediatrics': {
    name: 'Pediatría',
    icon: '👶',
    description: 'Atención médica especializada en menores',
    consultation: [
      'Paciente pediátrico de 4 años.',
      'Fiebre de 38.5°C por 3 días.',
      'Tos seca y congestión nasal.',
      'Irritabilidad y rechazo al alimento.',
      'Vómitos ocasionales.',
      'Madre refiere contacto con caso COVID-19.',
      'Esquema de vacunación completo.',
      'Solicita evaluación pediátrica.'
    ],
    analysis: [
      'Síndrome febril en preescolar',
      'Síntomas respiratorios altos',
      'Exposición COVID-19 confirmada',
      'Evaluación integral necesaria'
    ],
    recommendations: [
      'Test rápido COVID-19',
      'Manejo sintomático de fiebre',
      'Hidratación y aislamiento',
      'Control en 24-48 horas'
    ]
  },
  
  'hiv_pregnancy_adolescent': {
    name: 'VIH + Embarazo Adolescente',
    icon: '🤰',
    description: 'Caso especial de población vulnerable crítica',
    consultation: [
      'Paciente femenina de 17 años, embarazada de 24 semanas.',
      'Diagnóstico de VIH positivo desde hace 6 meses.',
      'Carga viral detectada en último control.',
      'Consulta por adherencia al tratamiento antirretroviral.',
      'Refiere náuseas matutinas y fatiga extrema.',
      'Preocupación por transmisión vertical al bebé.',
      'Apoyo familiar limitado, situación socioeconómica precaria.',
      'Necesita orientación nutricional y psicológica.'
    ],
    analysis: [
      'Se detectan factores de riesgo críticos',
      'Urgencia: Alta - Embarazo VIH+ adolescente',
      'Protocolo especializado requerido',
      'Equipo multidisciplinario necesario'
    ],
    recommendations: [
      'Monitoreo carga viral cada 4 semanas',
      'Suplementación nutricional específica',
      'Apoyo psicológico continuo',
      'Coordinación infectología-obstetricia'
    ]
  },
  
  'quality_of_life': {
    name: 'Calidad de Vida',
    icon: '💙',
    description: 'Enfoque holístico en bienestar del paciente',
    consultation: [
      'Paciente masculino de 45 años.',
      'Refiere fatiga crónica y pérdida de peso.',
      'Alimentación irregular, sin recursos para dieta balanceada.',
      'Insomnio y episodios de ansiedad frecuentes.',
      'Trabajo físico demandante, sin seguro médico.',
      'Último chequeo médico hace 3 años.',
      'Antecedentes de diabetes en familia.',
      'Solicita orientación general de salud.'
    ],
    analysis: [
      'Múltiples factores de riesgo identificados',
      'Prioridad: Alta - Vulnerabilidad social',
      'Screening preventivo urgente',
      'Intervención nutricional necesaria'
    ],
    recommendations: [
      'Evaluación nutricional completa',
      'Screening de enfermedades crónicas',
      'Programa de ejercicio adaptado',
      'Conectar con recursos comunitarios'
    ]
  }
};

export function useDemoTranscription(strategy = 'general_medicine') {
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [showSpecialtyConfirmation, setShowSpecialtyConfirmation] = useState(false);
  const [consultationGenerated, setConsultationGenerated] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [demoText, setDemoText] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  // Track all demo timeouts for proper cleanup to avoid memory leaks
  const timeoutsRef = useRef([]);
  const demoStrategy = DEMO_STRATEGIES[strategy] || DEMO_STRATEGIES['general_medicine'];

  const selectSpecialty = (specialty) => {
    setSelectedSpecialty(specialty);
    setShowSpecialtyConfirmation(true);
    
    // Track analytics
    trackConsultationEvent('specialty_selected', { specialty });
  };
  
  const confirmSpecialtyAndGenerate = () => {
    if (!selectedSpecialty) return;
    
    setShowSpecialtyConfirmation(false);
    setConsultationGenerated(true);
    
    // Track analytics
    trackConsultationEvent('consultation_generated', { specialty: selectedSpecialty });
    
    // Start the automatic consultation generation
    startDemoRecording();
  };
  
  const trackConsultationEvent = (event, metadata = {}) => {
    // Generate session ID if not exists
    if (!sessionStorage.getItem('consultation_session_id')) {
      sessionStorage.setItem('consultation_session_id', Date.now().toString());
    }
    
    const analyticsData = {
      sessionId: sessionStorage.getItem('consultation_session_id'),
      event,
      specialty: selectedSpecialty,
      location: 'transcription_panel',
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }
    };
    
    // Send to analytics endpoint
    fetch('/api/analytics/consultation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analyticsData)
    }).catch(console.error);
  };
  
  const startDemoRecording = () => {
    if (isRecording) return;
    
    setIsRecording(true);
    setDemoText('');
    setCurrentAnalysis([]);
    setRecommendations([]);
    setRecordingTime(0);
    setConfidence(0);
    setIsAnalyzing(false);
    
    // Track recording start
    trackConsultationEvent('recording_started');

    // Timer para duración de grabación
    intervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    // Simulación de transcripción en tiempo real
    let currentIndex = 0;
    const consultation = demoStrategy.consultation;
    
    const addNextSentence = () => {
      if (currentIndex < consultation.length && isRecording) {
        const sentence = consultation[currentIndex];
        setDemoText(prev => prev + (prev ? ' ' : '') + sentence);
        setConfidence(typeof window !== 'undefined' ? 0.85 + Math.random() * 0.1 : 0.9); // 85-95% confidence SOLO CLIENT
        currentIndex++;
        
        // Tiempo variable entre oraciones (1.5-3 segundos) - SOLO CLIENT SIDE
        const nextDelay = typeof window !== 'undefined' ? 1500 + Math.random() * 1500 : 2000;
        timeoutsRef.current.push(setTimeout(addNextSentence, nextDelay));
        
        // Iniciar análisis después de la tercera oración
        if (currentIndex === 3) {
          startAnalysis();
        }
      }
    };

    // Comenzar transcripción después de un pequeño delay
    timeoutsRef.current.push(setTimeout(addNextSentence, 800));
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    
    const analysis = demoStrategy.analysis;
    let analysisIndex = 0;
    
    const addAnalysisPoint = () => {
      if (analysisIndex < analysis.length) {
        setCurrentAnalysis(prev => [...prev, analysis[analysisIndex]]);
        analysisIndex++;
        timeoutsRef.current.push(setTimeout(addAnalysisPoint, 2000));
      } else {
        // Agregar recomendaciones después del análisis
        timeoutsRef.current.push(setTimeout(() => {
          setRecommendations(demoStrategy.recommendations);
          setIsAnalyzing(false);
        }, 1500));
      }
    };

    timeoutsRef.current.push(setTimeout(addAnalysisPoint, 1000));
  };

  const stopDemoRecording = () => {
    setIsRecording(false);
    setIsAnalyzing(false);
    
    // MEMORY LEAK FIX: More defensive cleanup
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Clear all scheduled timeouts - ENHANCED
    timeoutsRef.current.forEach((timeoutId) => {
      if (timeoutId) clearTimeout(timeoutId);
    });
    timeoutsRef.current = [];
  };

  const resetDemo = () => {
    // MEMORY LEAK FIX: Enhanced reset with comprehensive cleanup
    stopDemoRecording();
    
    // Reset all state
    setDemoText('');
    setCurrentAnalysis([]);
    setRecommendations([]);
    setRecordingTime(0);
    setConfidence(0);
    setSelectedSpecialty(null);
    setShowSpecialtyConfirmation(false);
    setConsultationGenerated(false);
    
    // Additional safety cleanup
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    timeoutsRef.current.forEach(t => t && clearTimeout(t));
    timeoutsRef.current = [];
  };

  // MEMORY LEAK FIX: Comprehensive cleanup on unmount
  useEffect(() => {
    return () => {
      // Force stop recording to ensure all cleanup
      setIsRecording(false);
      setIsAnalyzing(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Clear all timeouts with null check
      timeoutsRef.current.forEach((timeoutId) => {
        if (timeoutId) clearTimeout(timeoutId);
      });
      timeoutsRef.current = [];
    };
  }, []);

  return {
    // Estado
    isRecording,
    demoText,
    currentAnalysis,
    recommendations,
    recordingTime,
    confidence,
    isAnalyzing,
    selectedSpecialty,
    showSpecialtyConfirmation,
    consultationGenerated,
    
    // Acciones
    startDemoRecording,
    stopDemoRecording,
    resetDemo,
    selectSpecialty,
    confirmSpecialtyAndGenerate,
    
    // Info de estrategia
    strategyName: demoStrategy.name,
    availableStrategies: Object.keys(DEMO_STRATEGIES),
    availableSpecialties: DEMO_STRATEGIES
  };
}

export default useDemoTranscription;