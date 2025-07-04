import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DocumentTextIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  CheckCircleIcon,
  SparklesIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useConsultation } from '../../contexts/ConsultationContext';
import { mockMedicalAI } from '../../utils/medicalUtils';

const DocumentationOutput = () => {
  const {
    finalTranscript,
    soapNotes,
    isGeneratingSOAP,
    updateSoapSection,
    logEvent,
    sessionDuration,
    startTime
  } = useConsultation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [autoGenerateEnabled, setAutoGenerateEnabled] = useState(true);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  // Auto-generate SOAP notes when transcript is available
  useEffect(() => {
    if (finalTranscript.length > 100 && autoGenerateEnabled && !isGeneratingSOAP) {
      generateSOAPNotes();
    }
  }, [finalTranscript, autoGenerateEnabled]);
  
  const generateSOAPNotes = async () => {
    if (!finalTranscript.trim()) return;
    
    setGenerationProgress(0);
    logEvent('soap_generation_started', { transcript_length: finalTranscript.length });
    
    try {
      // Simulate progressive generation
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      // Generate each section
      const soapData = await generateStructuredSOAP(finalTranscript);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      // Update each section
      Object.entries(soapData).forEach(([section, content]) => {
        updateSoapSection(section, content);
      });
      
      setTimeout(() => setGenerationProgress(0), 1000);
      
      logEvent('soap_generation_completed', { 
        sections_generated: Object.keys(soapData).length,
        total_length: Object.values(soapData).join('').length
      });
      
    } catch (error) {
      console.error('Error generating SOAP notes:', error);
      setGenerationProgress(0);
      logEvent('soap_generation_failed', { error: error.message });
    }
  };
  
  const generateStructuredSOAP = async (transcript) => {
    // Mock structured SOAP generation based on transcript analysis
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate AI processing
    
    // Extract key information from transcript
    const patientInfo = extractPatientInfo(transcript);
    const symptoms = extractSymptoms(transcript);
    const examination = extractExaminationFindings(transcript);
    
    return {
      subjective: generateSubjective(patientInfo, symptoms),
      objective: generateObjective(examination, transcript),
      assessment: generateAssessment(symptoms, examination),
      plan: generatePlan(symptoms, examination)
    };
  };
  
  const extractPatientInfo = (transcript) => {
    // Mock extraction - in real implementation, this would use NLP
    const ageMatch = transcript.match(/(\d+)\s+años?/);
    const genderMatch = transcript.match(/(masculino|femenino|hombre|mujer)/i);
    
    return {
      age: ageMatch ? ageMatch[1] : 'no especificada',
      gender: genderMatch ? genderMatch[1] : 'no especificado'
    };
  };
  
  const extractSymptoms = (transcript) => {
    const commonSymptoms = [
      'dolor', 'fiebre', 'tos', 'fatiga', 'cefalea', 'náusea', 'vómito',
      'diarrea', 'estreñimiento', 'mareo', 'palpitaciones'
    ];
    
    return commonSymptoms.filter(symptom => 
      transcript.toLowerCase().includes(symptom)
    );
  };
  
  const extractExaminationFindings = (transcript) => {
    // Mock extraction of physical examination findings
    const findings = [];
    
    if (transcript.includes('presión arterial') || transcript.includes('tensión')) {
      findings.push('Signos vitales registrados');
    }
    if (transcript.includes('auscultación') || transcript.includes('corazón')) {
      findings.push('Auscultación cardiopulmonar');
    }
    if (transcript.includes('palpación') || transcript.includes('abdomen')) {
      findings.push('Exploración abdominal');
    }
    
    return findings;
  };
  
  const generateSubjective = (patientInfo, symptoms) => {
    const symptomsText = symptoms.length > 0 
      ? `Paciente refiere ${symptoms.join(', ')}.`
      : 'Paciente acude a consulta por molestias.';
    
    return `Paciente de ${patientInfo.age} años, ${patientInfo.gender}. ${symptomsText} Consulta para evaluación médica y orientación terapéutica. Niega alergias medicamentosas conocidas.`;
  };
  
  const generateObjective = (examination, transcript) => {
    let objective = 'Paciente consciente, orientado, colaborador. ';
    
    if (examination.length > 0) {
      objective += `Exploración física: ${examination.join(', ')}. `;
    }
    
    objective += 'Signos vitales estables. Aspecto general conservado.';
    
    return objective;
  };
  
  const generateAssessment = (symptoms, examination) => {
    if (symptoms.length === 0) {
      return 'Evaluación clínica en proceso. Se requiere completar historia clínica y exploración física para establecer diagnóstico definitivo.';
    }
    
    const primarySymptom = symptoms[0];
    const assessments = {
      'dolor': 'Síndrome doloroso a determinar etiología. Considerar causas inflamatorias, mecánicas o neuropáticas.',
      'fiebre': 'Síndrome febril. Evaluar foco infeccioso. Considerar proceso viral vs bacteriano.',
      'tos': 'Síndrome tusígeno. Investigar etiología respiratoria alta vs baja.',
      'fatiga': 'Astenia. Descartar causas metabólicas, infecciosas o hematológicas.'
    };
    
    return assessments[primarySymptom] || 'Cuadro clínico en estudio. Requiere evaluación complementaria para diagnóstico diferencial.';
  };
  
  const generatePlan = (symptoms, examination) => {
    let plan = '• Continuar con anamnesis dirigida\n';
    plan += '• Completar exploración física sistemática\n';
    
    if (symptoms.includes('dolor')) {
      plan += '• Escala de dolor y características\n';
      plan += '• Considerar analgesia según intensidad\n';
    }
    
    if (symptoms.includes('fiebre')) {
      plan += '• Laboratorios: BHC, QS, reactantes de fase aguda\n';
      plan += '• Antipirético según necesidad\n';
    }
    
    plan += '• Seguimiento en 24-48 horas\n';
    plan += '• Regresar si empeoramiento o nuevos síntomas';
    
    return plan;
  };
  
  const handleSectionEdit = (section, newContent) => {
    updateSoapSection(section, newContent);
    setEditingSection(null);
    logEvent('soap_section_edited', { section, content_length: newContent.length });
  };
  
  const copyToClipboard = async () => {
    const soapText = formatSOAPForExport();
    
    try {
      await navigator.clipboard.writeText(soapText);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
      logEvent('soap_copied', { text_length: soapText.length });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };
  
  const exportToPDF = () => {
    logEvent('pdf_export_requested');
    // Here you would implement PDF export functionality
    alert('Función de exportar PDF en desarrollo');
  };
  
  const formatSOAPForExport = () => {
    const timestamp = startTime ? startTime.toLocaleString() : new Date().toLocaleString();
    
    return `NOTA MÉDICA - ${timestamp}
Duración de consulta: ${Math.floor(sessionDuration / 60)} minutos

SUBJETIVO:
${soapNotes.subjective || 'No generado'}

OBJETIVO:
${soapNotes.objective || 'No generado'}

EVALUACIÓN/ANÁLISIS:
${soapNotes.assessment || 'No generado'}

PLAN:
${soapNotes.plan || 'No generado'}

---
Transcripción original disponible por separado.
Generado con asistencia de IA médica - Revisar y validar contenido.`;
  };
  
  const getSectionIcon = (section) => {
    const icons = {
      subjective: UserIcon,
      objective: CheckCircleIcon,
      assessment: SparklesIcon,
      plan: DocumentTextIcon
    };
    return icons[section] || DocumentTextIcon;
  };
  
  const getSectionTitle = (section) => {
    const titles = {
      subjective: 'SUBJETIVO',
      objective: 'OBJETIVO', 
      assessment: 'ANÁLISIS',
      plan: 'PLAN'
    };
    return titles[section] || section.toUpperCase();
  };
  
  const getSectionColor = (section) => {
    const colors = {
      subjective: 'border-blue-200 bg-blue-50',
      objective: 'border-green-200 bg-green-50',
      assessment: 'border-yellow-200 bg-yellow-50',
      plan: 'border-purple-200 bg-purple-50'
    };
    return colors[section] || 'border-gray-200 bg-gray-50';
  };
  
  const hasContent = Object.values(soapNotes).some(content => content && content.trim().length > 0);
  
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Documentación Médica</h2>
              <p className="text-sm text-gray-600">
                Notas SOAP generadas automáticamente
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Auto-generate toggle */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoGenerateEnabled}
                onChange={(e) => setAutoGenerateEnabled(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Auto-generar</span>
            </label>
            
            {/* Manual generate button */}
            <button
              onClick={generateSOAPNotes}
              disabled={!finalTranscript || isGeneratingSOAP}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors text-sm"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>Generar SOAP</span>
            </button>
            
            {/* Export controls */}
            {hasContent && (
              <>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  <span>Copiar</span>
                </button>
                
                <button
                  onClick={exportToPDF}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>PDF</span>
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Generation Progress */}
        <AnimatePresence>
          {generationProgress > 0 && generationProgress < 100 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">Generando notas SOAP...</span>
                <span className="text-sm text-blue-600">{generationProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <motion.div
                  className="bg-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${generationProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* SOAP Sections */}
        {hasContent ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(soapNotes).map(([section, content]) => {
              const Icon = getSectionIcon(section);
              const isEditing = editingSection === section;
              
              return (
                <div
                  key={section}
                  className={`rounded-lg border-2 ${getSectionColor(section)} transition-all duration-200`}
                >
                  {/* Section Header */}
                  <div className="p-4 border-b border-current border-opacity-20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-5 h-5" />
                        <h3 className="font-semibold">{getSectionTitle(section)}</h3>
                      </div>
                      <button
                        onClick={() => setEditingSection(isEditing ? null : section)}
                        className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Section Content */}
                  <div className="p-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <textarea
                          defaultValue={content}
                          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder={`Contenido ${getSectionTitle(section).toLowerCase()}...`}
                          onBlur={(e) => handleSectionEdit(section, e.target.value)}
                          autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setEditingSection(null)}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        {content ? (
                          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                            {content}
                          </pre>
                        ) : (
                          <p className="text-gray-500 italic">
                            {`Contenido ${getSectionTitle(section).toLowerCase()} se generará automáticamente...`}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              No hay documentación disponible
            </h3>
            <p className="text-gray-400 mb-4">
              {finalTranscript.length === 0 
                ? 'Inicia la grabación para generar notas SOAP automáticamente'
                : 'Las notas SOAP se generarán cuando haya suficiente contenido transcrito'
              }
            </p>
            {finalTranscript.length > 0 && (
              <button
                onClick={generateSOAPNotes}
                className="flex items-center space-x-2 mx-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>Generar Notas SOAP</span>
              </button>
            )}
          </div>
        )}
        
        {/* Session Info */}
        <div className="mt-6 flex items-center justify-between text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              Duración: {Math.floor(sessionDuration / 60)}:{(sessionDuration % 60).toString().padStart(2, '0')}
            </span>
            <span>
              Palabras transcritas: {finalTranscript.split(' ').filter(word => word.length > 0).length}
            </span>
          </div>
          <div className="text-xs">
            {startTime && `Iniciado: ${startTime.toLocaleTimeString()}`}
          </div>
        </div>
      </div>
      
      {/* Copy Success Notification */}
      <AnimatePresence>
        {showCopySuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '50%' }}
            animate={{ opacity: 1, y: 0, x: '50%' }}
            exit={{ opacity: 0, y: 50, x: '50%' }}
            className="fixed bottom-4 right-4 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5" />
              <span>Copiado al portapapeles</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentationOutput;