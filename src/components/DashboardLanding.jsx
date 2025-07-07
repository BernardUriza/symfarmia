"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MicrophoneIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  PlayIcon,
  StopIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { mockMedicalAI } from '../utils/medicalUtils';
import { mockMedicalReports } from '../data/mockMedicalReports';
import { useTranslation } from '../../app/providers/I18nProvider';
import ConsultationWorkspace from './ConsultationWorkspace';

const DashboardLanding = () => {
  const [activeFlow, setActiveFlow] = useState(null);
  const { t } = useTranslation();
  
  // Debug: Log when dashboard mounts
  useEffect(() => {
    console.log('DashboardLanding: Component mounted, current URL:', window.location.href);
  }, []);
  
  const exitDemoMode = () => {
    console.log('DashboardLanding: Exit demo mode clicked');
    window.location.href = window.location.pathname; // Remove query params
  };
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [soapSummary, setSoapSummary] = useState(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const intervalRef = useRef(null);

  const draftReportsCount = mockMedicalReports.filter(
    r => r.status === 'Borrador'
  ).length;
  const pendingReportsCount = mockMedicalReports.filter(
    r => r.status === 'Pendiente'
  ).length;
  const totalReportsCount = mockMedicalReports.length;

  // Analytics tracking function
  const trackEvent = (eventName, eventData = {}) => {
    const eventPayload = {
      event: eventName,
      timestamp: new Date().toISOString(),
      user: 'demo-user',
      ...eventData
    };
    
    // Send to your analytics service
    console.log('Analytics Event:', eventPayload);
    
    // You can replace this with your actual analytics service
    // Example: analytics.track(eventPayload);
  };

  const handleProbarAsistente = () => {
    trackEvent('button_click', { button: 'probar_asistente' });
    setActiveFlow('assistant');
    // Here you would integrate with your existing MedicalAssistant component
    // For demo purposes, we'll show a simple modal
  };

  const handleTranscribirConsulta = () => {
    trackEvent('button_click', { button: 'transcribir_consulta' });
    setActiveFlow('consultation_workspace');
  };

  const handleVerAnalisis = () => {
    trackEvent('button_click', { button: 'ver_analisis' });
    setActiveFlow('analysis');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setRecording(true);
      
      // Start timer
      setRecordingTime(0);
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      trackEvent('recording_started', { duration: 0 });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      trackEvent('recording_stopped', { duration: recordingTime });
      
      // Auto-start transcription after recording
      setTimeout(() => {
        processAudio();
      }, 1000);
    }
  };

  const processAudio = async () => {
    if (!audioBlob) return;
    
    setTranscribing(true);
    trackEvent('transcription_started');
    
    // Simulate transcription process
    setTimeout(() => {
      const mockTranscript = `
Paciente masculino de 45 años que consulta por dolor torácico intermitente de 2 semanas de evolución. 
Refiere dolor opresivo retroesternal que se irradia al brazo izquierdo, especialmente durante el ejercicio.
Antecedentes: Hipertensión arterial diagnosticada hace 3 años, fumador de 20 cigarrillos por día durante 20 años.
Medicación actual: Enalapril 10mg cada 12 horas.
Examen físico: Tensión arterial 150/90 mmHg, frecuencia cardíaca 88 lpm, peso 85 kg, talla 175 cm.
Auscultación cardiopulmonar normal. No edemas en miembros inferiores.
      `.trim();
      
      setTranscript(mockTranscript);
      setTranscribing(false);
      trackEvent('transcription_completed', { transcript_length: mockTranscript.length });
      
      // Auto-generate SOAP summary
      setTimeout(() => {
        generateSoapSummary(mockTranscript);
      }, 1000);
    }, 3000);
  };

  const generateSoapSummary = async (transcriptText) => {
    setGenerating(true);
    trackEvent('soap_generation_started');
    
    try {
      await mockMedicalAI.generateResponse(
        transcriptText,
        { patient: { age: 45, gender: 'male' } },
        'soap'
      );
      
      const soapData = {
        subjetivo: "Paciente masculino de 45 años consulta por dolor torácico intermitente de 2 semanas de evolución. Dolor opresivo retroesternal que se irradia al brazo izquierdo, especialmente durante ejercicio. Antecedente de HTA e historia de tabaquismo (20 cigarrillos/día x 20 años).",
        objetivo: "TA: 150/90 mmHg, FC: 88 lpm, Peso: 85 kg, Talla: 175 cm, IMC: 27.8. Auscultación cardiopulmonar normal. Sin edemas en MMII.",
        analisis: "Dolor torácico de características anginosas en paciente con factores de riesgo cardiovascular (HTA, tabaquismo, sexo masculino >45 años). Sospecha de enfermedad coronaria. TA elevada sugiere descontrol hipertensivo.",
        plan: `
• Estudios complementarios:
  - ECG de 12 derivaciones
  - Ecocardiograma
  - Ergometría o prueba de esfuerzo
  - Laboratorio: perfil lipídico, glucemia, función renal
  
• Tratamiento:
  - Optimizar control de HTA: considerar aumento de dosis de enalapril
  - Antiagregación plaquetaria: aspirina 100mg/día
  - Estatina: atorvastatina 20mg/día
  - Cesación tabáquica
  
• Seguimiento:
  - Control en 1 semana para evaluar estudios
  - Derivación a cardiología si ergometría positiva
  - Educación sobre factores de riesgo cardiovascular
        `.trim(),
        fecha: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString(),
        duracion: Math.floor(recordingTime / 60) + ':' + (recordingTime % 60).toString().padStart(2, '0')
      };
      
      setSoapSummary(soapData);
      setGenerating(false);
      trackEvent('soap_generation_completed', { summary_length: JSON.stringify(soapData).length });
    } catch (error) {
      console.error('Error generating SOAP summary:', error);
      setGenerating(false);
      trackEvent('soap_generation_failed', { error: error.message });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
      trackEvent('copy_summary', { text_length: text.length });
    });
  };

  const exportToPDF = () => {
    trackEvent('export_pdf_requested');
    // Here you would implement PDF export functionality
    // For demo, we'll just show an alert
    alert('Función de exportar PDF en desarrollo');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderMainDashboard = () => (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bienvenido a SYMFARMIA
        </h1>
        <p className="text-xl text-gray-600">
          Tu asistente médico inteligente
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Probar Asistente IA */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="medical-card bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 cursor-pointer"
          onClick={handleProbarAsistente}
        >
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <DocumentTextIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Probar Asistente IA
          </h3>
          <p className="text-gray-600 text-center">
            Interactúa con nuestro asistente médico inteligente para obtener apoyo clínico
          </p>
        </motion.div>

        {/* Transcribir Consulta */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="medical-card bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 cursor-pointer"
          onClick={handleTranscribirConsulta}
        >
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MicrophoneIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Transcribir Consulta
          </h3>
          <p className="text-gray-600 text-center">
            Graba tu consulta y obtén un resumen clínico estructurado automáticamente
          </p>
        </motion.div>

        {/* Ver Análisis IA */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="medical-card bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8 cursor-pointer"
          onClick={handleVerAnalisis}
        >
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ChartBarIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Ver Análisis IA
          </h3>
          <p className="text-gray-600 text-center">
            Explora análisis y métricas de tus consultas médicas
          </p>
        </motion.div>

        {/* NEW: Reportes Médicos Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{t('medical_reports')}</h3>
              <p className="text-sm text-gray-600">{t('medical_reports_desc')}</p>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('drafts')}:</span>
              <span className="font-medium">{draftReportsCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('pending_signature')}:</span>
              <span className="font-medium text-amber-600">{pendingReportsCount}</span>
            </div>
          </div>
          <button
            onClick={() => (window.location.href = '/reportes-medicos')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {t('view_reports')} ({totalReportsCount})
          </button>
        </div>
      </div>
      
      {/* Demo info */}
      <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <UserIcon className="w-6 h-6 text-yellow-600 mr-3" />
            <div>
              <h4 className="text-lg font-semibold text-yellow-800">Modo Demo</h4>
              <p className="text-yellow-700">
                Estás explorando SYMFARMIA en modo demo. Todas las funcionalidades están disponibles con datos de ejemplo.
              </p>
            </div>
          </div>
          <button
            onClick={exitDemoMode}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Salir del Demo
          </button>
        </div>
      </div>
    </div>
  );

  const renderTranscriptionFlow = () => (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <button
          onClick={() => setActiveFlow(null)}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Volver al dashboard
        </button>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Transcribir Consulta
        </h2>
        <p className="text-gray-600">
          Graba tu consulta médica y obtén un resumen clínico estructurado
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recording Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 border">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <MicrophoneIcon className="w-6 h-6 mr-2" />
            Grabación
          </h3>
          
          <div className="text-center mb-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
              recording ? 'bg-red-500 animate-pulse' : 'bg-gray-200'
            }`}>
              {recording ? (
                <StopIcon className="w-12 h-12 text-white" />
              ) : (
                <PlayIcon className="w-12 h-12 text-gray-600" />
              )}
            </div>
            
            {recording && (
              <div className="mb-4">
                <div className="text-2xl font-bold text-red-600">
                  {formatTime(recordingTime)}
                </div>
                <div className="text-sm text-gray-500">Grabando...</div>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {!recording && !audioBlob && (
              <button
                onClick={startRecording}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                <PlayIcon className="w-5 h-5 inline mr-2" />
                Iniciar Grabación
              </button>
            )}
            
            {recording && (
              <button
                onClick={stopRecording}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                <StopIcon className="w-5 h-5 inline mr-2" />
                Detener Grabación
              </button>
            )}
            
            {audioBlob && !recording && (
              <div className="text-center">
                <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Grabación completada</p>
              </div>
            )}
          </div>
        </div>

        {/* Transcription Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 border">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <DocumentTextIcon className="w-6 h-6 mr-2" />
            Transcripción
          </h3>
          
          {transcribing ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Transcribiendo audio...</p>
            </div>
          ) : transcript ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {transcript}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(transcript)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                <DocumentDuplicateIcon className="w-5 h-5 inline mr-2" />
                Copiar Transcripción
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>La transcripción aparecerá aquí</p>
            </div>
          )}
        </div>
      </div>

      {/* SOAP Summary */}
      {(generating || soapSummary) && (
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border">
          <h3 className="text-xl font-semibold mb-4">
            Resumen Clínico (SOAP)
          </h3>
          
          {generating ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Generando resumen clínico...</p>
            </div>
          ) : soapSummary && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                <div>Fecha: {soapSummary.fecha}</div>
                <div>Hora: {soapSummary.hora}</div>
                <div>Duración: {soapSummary.duracion}</div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">SUBJETIVO</h4>
                  <p className="text-blue-800 text-sm">{soapSummary.subjetivo}</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">OBJETIVO</h4>
                  <p className="text-green-800 text-sm">{soapSummary.objetivo}</p>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">ANÁLISIS</h4>
                  <p className="text-yellow-800 text-sm">{soapSummary.analisis}</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">PLAN</h4>
                  <pre className="text-purple-800 text-sm whitespace-pre-wrap font-sans">
                    {soapSummary.plan}
                  </pre>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => copyToClipboard(
                    `RESUMEN CLÍNICO - ${soapSummary.fecha}\n\n` +
                    `SUBJETIVO:\n${soapSummary.subjetivo}\n\n` +
                    `OBJETIVO:\n${soapSummary.objetivo}\n\n` +
                    `ANÁLISIS:\n${soapSummary.analisis}\n\n` +
                    `PLAN:\n${soapSummary.plan}`
                  )}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  <DocumentDuplicateIcon className="w-5 h-5 inline mr-2" />
                  Copiar Resumen
                </button>
                
                <button
                  onClick={exportToPDF}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  <ArrowDownTrayIcon className="w-5 h-5 inline mr-2" />
                  Exportar PDF
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Copy Success Message */}
      <AnimatePresence>
        {showCopySuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            <CheckCircleIcon className="w-5 h-5 inline mr-2" />
            Copiado al portapapeles
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {activeFlow === null && renderMainDashboard()}
      {activeFlow === 'transcription' && renderTranscriptionFlow()}
      {activeFlow === 'consultation_workspace' && (
        <ConsultationWorkspace onExit={() => setActiveFlow(null)} />
      )}
      {activeFlow === 'assistant' && (
        <div className="max-w-4xl mx-auto p-8">
          <button
            onClick={() => setActiveFlow(null)}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Volver al dashboard
          </button>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <DocumentTextIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Asistente IA Médico
            </h2>
            <p className="text-gray-600 mb-6">
              Esta funcionalidad se integraría con tu componente MedicalAssistant existente
            </p>
            <button
              onClick={() => setActiveFlow(null)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
      {activeFlow === 'analysis' && (
        <div className="max-w-4xl mx-auto p-8">
          <button
            onClick={() => setActiveFlow(null)}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Volver al dashboard
          </button>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <ChartBarIcon className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Análisis IA
            </h2>
            <p className="text-gray-600 mb-6">
              Aquí se mostrarían los análisis y métricas de tus consultas médicas
            </p>
            <button
              onClick={() => setActiveFlow(null)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLanding;