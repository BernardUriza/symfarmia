"use client";

import React, { useState } from 'react';
import { useTranslation } from '../providers/I18nProvider';
import { ConversationCapture } from '../components/medical/ConversationCapture';
import { ClinicalNotes } from '../components/medical/ClinicalNotes';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Mic, MicOff, Clock, User, Stethoscope, FileText, Users, FolderOpen, Calendar, MessageSquare, FileSearch, UserPlus, AlertCircle, Activity } from 'lucide-react';
import { medicalTheme } from '../../src/shared/ui/themes/medical.theme';

const DemoSteps = t => ([
  { id: 'capture', label: t('demo.capture'), icon: Mic, component: ConversationCapture },
  { id: 'notes', label: t('notes'), icon: FileText, component: ClinicalNotes },
]);

export default function MedicalAIDemo() {
  const { t } = useTranslation();
  const steps = DemoSteps(t);
  const [currentStep, setCurrentStep] = useState('capture');
  const [isRecording, setIsRecording] = useState(false);
  const [encounterTime] = useState('00:08:23');
  
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const CurrentComponent = steps[currentStepIndex].component;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      {/* Professional Medical Header */}
      <header className="bg-white border-b px-4 py-3 relative z-10" style={{ borderColor: medicalTheme.colors.primary[200], boxShadow: medicalTheme.shadows.medical.card }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: medicalTheme.colors.primary[600] }}>
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold" style={{ color: medicalTheme.colors.primary[900], fontFamily: medicalTheme.typography.medical.fontFamily }}>SYMFARMIA</h1>
                <p className="text-sm" style={{ color: medicalTheme.colors.primary[600] }}>Sistema Médico Profesional</p>
              </div>
            </div>
          </div>

          {/* Professional Patient Information */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: medicalTheme.colors.primary[50], border: `1px solid ${medicalTheme.colors.primary[200]}` }}>
              <User className="h-4 w-4" style={{ color: medicalTheme.colors.primary[600] }} />
              <span className="font-medium" style={{ color: medicalTheme.colors.primary[900], fontSize: medicalTheme.typography.medical.sizes.metadata }}>María García, FN: 15/03/1985</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: medicalTheme.colors.semantic.patientSafe + '20', border: `1px solid ${medicalTheme.colors.semantic.patientSafe}` }}>
              <Clock className="h-4 w-4" style={{ color: medicalTheme.colors.semantic.patientSafe }} />
              <span className="font-medium" style={{ color: medicalTheme.colors.primary[900], fontSize: medicalTheme.typography.medical.sizes.metadata }}>{encounterTime}</span>
            </div>
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="sm"
              onClick={() => setIsRecording(!isRecording)}
              className="flex items-center gap-2 font-medium"
              style={{ 
                backgroundColor: isRecording ? medicalTheme.colors.medical.emergency : medicalTheme.colors.semantic.transcriptionActive,
                color: 'white',
                border: 'none',
                borderRadius: medicalTheme.borders.radius.md
              }}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isRecording ? t('transcription.stop_recording') : t('transcription.start_recording')}
            </Button>
          </div>
        </div>

        {/* Professional Medical Progress */}
        <div className="mt-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-300 rounded-full"
              style={{ 
                width: `${progress}%`,
                backgroundColor: medicalTheme.colors.semantic.transcriptionActive
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <span
                key={step.id}
                className="text-xs font-medium"
                style={{ 
                  color: index <= currentStepIndex ? medicalTheme.colors.primary[600] : medicalTheme.colors.medical.neutral,
                  fontFamily: medicalTheme.typography.medical.fontFamily
                }}
              >
                {step.label}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Professional Medical Navigation Sidebar */}
        <div className="hidden md:block w-80 bg-white border-r" style={{ borderColor: medicalTheme.colors.primary[200], boxShadow: medicalTheme.shadows.medical.card }}>
          {/* Medical Navigation Sections */}
          <div className="p-6">
            {/* Patient Management Section */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold mb-4" style={{ color: medicalTheme.colors.primary[900], fontFamily: medicalTheme.typography.medical.fontFamily }}>PACIENTES</h2>
              <nav className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors" style={{ backgroundColor: medicalTheme.colors.primary[50], color: medicalTheme.colors.primary[900], border: `1px solid ${medicalTheme.colors.primary[200]}` }}>
                  <Users className="h-4 w-4" style={{ color: medicalTheme.colors.primary[600] }} />
                  <span className="text-sm font-medium">Ver Todos los Pacientes</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors hover:bg-gray-50" style={{ color: medicalTheme.colors.primary[700] }}>
                  <UserPlus className="h-4 w-4" style={{ color: medicalTheme.colors.primary[600] }} />
                  <span className="text-sm font-medium">Nuevo Paciente</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors hover:bg-gray-50" style={{ color: medicalTheme.colors.primary[700] }}>
                  <FileSearch className="h-4 w-4" style={{ color: medicalTheme.colors.primary[600] }} />
                  <span className="text-sm font-medium">Buscar Paciente</span>
                </button>
              </nav>
            </div>

            {/* Consultation Management Section */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold mb-4" style={{ color: medicalTheme.colors.primary[900], fontFamily: medicalTheme.typography.medical.fontFamily }}>CONSULTAS</h2>
              <nav className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors" style={{ backgroundColor: medicalTheme.colors.semantic.transcriptionActive + '20', color: medicalTheme.colors.primary[900], border: `1px solid ${medicalTheme.colors.semantic.transcriptionActive}` }}>
                  <Stethoscope className="h-4 w-4" style={{ color: medicalTheme.colors.semantic.transcriptionActive }} />
                  <span className="text-sm font-medium">Nueva Consulta</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors hover:bg-gray-50" style={{ color: medicalTheme.colors.primary[700] }}>
                  <Activity className="h-4 w-4" style={{ color: medicalTheme.colors.primary[600] }} />
                  <span className="text-sm font-medium">Consultas Activas</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors hover:bg-gray-50" style={{ color: medicalTheme.colors.primary[700] }}>
                  <Calendar className="h-4 w-4" style={{ color: medicalTheme.colors.primary[600] }} />
                  <span className="text-sm font-medium">Consultas Programadas</span>
                </button>
              </nav>
            </div>

            {/* Medical Reports Section */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold mb-4" style={{ color: medicalTheme.colors.primary[900], fontFamily: medicalTheme.typography.medical.fontFamily }}>REPORTES MÉDICOS</h2>
              <nav className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors hover:bg-gray-50" style={{ color: medicalTheme.colors.primary[700] }}>
                  <FolderOpen className="h-4 w-4" style={{ color: medicalTheme.colors.primary[600] }} />
                  <span className="text-sm font-medium">Reportes Médicos</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors hover:bg-gray-50" style={{ color: medicalTheme.colors.primary[700] }}>
                  <FileText className="h-4 w-4" style={{ color: medicalTheme.colors.primary[600] }} />
                  <span className="text-sm font-medium">Historial Clínico</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors hover:bg-gray-50" style={{ color: medicalTheme.colors.primary[700] }}>
                  <FileText className="h-4 w-4" style={{ color: medicalTheme.colors.primary[600] }} />
                  <span className="text-sm font-medium">Notas SOAP</span>
                </button>
              </nav>
            </div>

            {/* Demo Workflow Section */}
            <div>
              <h2 className="text-sm font-semibold mb-4" style={{ color: medicalTheme.colors.semantic.analysisProcessing, fontFamily: medicalTheme.typography.medical.fontFamily }}>FLUJO DE DEMOSTRACIÓN</h2>
              <nav className="space-y-2">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = step.id === currentStep;
                  const isCompleted = index < currentStepIndex;
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(step.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors`}
                      style={{
                        backgroundColor: isActive 
                          ? medicalTheme.colors.primary[100]
                          : isCompleted
                          ? medicalTheme.colors.semantic.confidenceHigh + '20'
                          : 'transparent',
                        color: isActive 
                          ? medicalTheme.colors.primary[900]
                          : isCompleted
                          ? medicalTheme.colors.semantic.confidenceHigh
                          : medicalTheme.colors.medical.neutral,
                        border: isActive 
                          ? `1px solid ${medicalTheme.colors.primary[300]}`
                          : isCompleted
                          ? `1px solid ${medicalTheme.colors.semantic.confidenceHigh}`
                          : '1px solid transparent'
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{step.label}</span>
                      {isCompleted && (
                        <Badge variant="secondary" className="ml-auto" style={{ backgroundColor: medicalTheme.colors.semantic.confidenceHigh + '20', color: medicalTheme.colors.semantic.confidenceHigh }}>
                          ✓
                        </Badge>
                      )}
                      {isActive && (
                        <Badge variant="secondary" className="ml-auto" style={{ backgroundColor: medicalTheme.colors.primary[100], color: medicalTheme.colors.primary[700] }}>
                          {t('active')}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Professional Medical Consultation Workspace */}
        <main className="flex-1 transition-all duration-200" style={{ backgroundColor: '#f8fafc' }}>
          <div className="p-8">
            {/* Medical Context Header */}
            <div className="mb-6 p-4 bg-white rounded-lg" style={{ border: `1px solid ${medicalTheme.colors.primary[200]}`, boxShadow: medicalTheme.shadows.medical.card }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: medicalTheme.colors.primary[100] }}>
                    <User className="h-6 w-6" style={{ color: medicalTheme.colors.primary[600] }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: medicalTheme.colors.primary[900], fontSize: medicalTheme.typography.medical.sizes.patientName }}>María García</h3>
                    <p className="text-sm" style={{ color: medicalTheme.colors.primary[600] }}>Paciente ID: 12345 | Fecha: {new Date().toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-full" style={{ backgroundColor: medicalTheme.colors.semantic.patientSafe + '20', color: medicalTheme.colors.semantic.patientSafe }}>
                    <span className="text-xs font-medium">ESTABLE</span>
                  </div>
                  <div className="px-3 py-1 rounded-full" style={{ backgroundColor: medicalTheme.colors.semantic.transcriptionActive + '20', color: medicalTheme.colors.semantic.transcriptionActive }}>
                    <span className="text-xs font-medium">CONSULTA ACTIVA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical AI Assistant and Consultation Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Consultation Area */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg p-6" style={{ border: `1px solid ${medicalTheme.colors.primary[200]}`, boxShadow: medicalTheme.shadows.medical.card }}>
                  <CurrentComponent 
                    onNext={() => {
                      const nextIndex = (currentStepIndex + 1) % steps.length;
                      setCurrentStep(steps[nextIndex].id);
                    }}
                    onPrevious={() => {
                      const prevIndex = currentStepIndex > 0 ? currentStepIndex - 1 : 0;
                      setCurrentStep(steps[prevIndex].id);
                    }}
                    isRecording={isRecording}
                    setIsRecording={setIsRecording}
                  />
                </div>
              </div>

              {/* Medical AI Assistant Panel */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg p-6" style={{ border: `1px solid ${medicalTheme.colors.primary[200]}`, boxShadow: medicalTheme.shadows.medical.card }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: medicalTheme.colors.semantic.medicalTermDetected }}>
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: medicalTheme.colors.primary[900], fontSize: medicalTheme.typography.medical.sizes.diagnosis }}>Asistente IA Médico</h3>
                      <p className="text-xs" style={{ color: medicalTheme.colors.semantic.transcriptionActive }}>Análisis en tiempo real</p>
                    </div>
                  </div>
                  
                  {/* Medical AI Chat Interface */}
                  <div className="space-y-4">
                    <div className="h-64 border rounded-lg p-4 overflow-y-auto" style={{ backgroundColor: '#f8fafc', borderColor: medicalTheme.colors.primary[200] }}>
                      <div className="flex items-center justify-center h-full text-center">
                        <div>
                          <Activity className="h-8 w-8 mx-auto mb-2" style={{ color: medicalTheme.colors.primary[400] }} />
                          <p className="text-sm" style={{ color: medicalTheme.colors.primary[600] }}>Esperando transcripción médica...</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Medical AI Input */}
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Describe los síntomas del paciente..."
                        className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                        style={{ 
                          backgroundColor: 'white',
                          borderColor: medicalTheme.colors.primary[200],
                          color: medicalTheme.colors.primary[900],
                          fontSize: medicalTheme.typography.medical.sizes.notes
                        }}
                      />
                      
                      {/* Medical Quick Actions */}
                      <div className="flex flex-wrap gap-2">
                        <button className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: medicalTheme.colors.semantic.medicalTermDetected + '20', color: medicalTheme.colors.semantic.medicalTermDetected }}>Síntomas</button>
                        <button className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: medicalTheme.colors.semantic.analysisProcessing + '20', color: medicalTheme.colors.semantic.analysisProcessing }}>Diagnóstico</button>
                        <button className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: medicalTheme.colors.semantic.confidenceHigh + '20', color: medicalTheme.colors.semantic.confidenceHigh }}>Tratamiento</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}