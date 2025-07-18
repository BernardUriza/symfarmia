"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/src/providers/I18nProvider';
import { 
  ConversationCapture, 
  DialogueFlow, 
  ClinicalNotes, 
  OrderEntry, 
  SummaryExport 
} from '@/src/components/medical';
// import { WhisperDebugPanel } from '@/src/components/medical/WhisperDebugPanel';
import { Button, Progress } from '@/src/components/ui';
import { Mic, MicOff, Clock, User, ArrowLeft, Stethoscope, FileText, Users, FolderOpen, MessageSquare, Activity, ClipboardList, Download } from 'lucide-react';
import Link from 'next/link';
import { DemoResetButton } from '../../src/domains/demo';
import { useDemoPatients } from '../../src/domains/demo/hooks/useDemoPatients';

// EXACT Figma workflow steps as specified
const getMedicalWorkflowSteps = (t) => [
  { id: 'escuchar', label: t('workflow.steps.listen'), icon: Mic, component: ConversationCapture },
  { id: 'revisar', label: t('workflow.steps.review'), icon: MessageSquare, component: DialogueFlow },
  { id: 'notas', label: t('workflow.steps.notes'), icon: FileText, component: ClinicalNotes },
  { id: 'ordenes', label: t('workflow.steps.orders'), icon: ClipboardList, component: OrderEntry },
  { id: 'resumen', label: t('workflow.steps.summary'), icon: Download, component: SummaryExport },
];

function MedicalAIDemo() {
  console.log('[MedicalAIDemo] Component rendering at', new Date().toISOString());
  
  const { t, translations, isLoadingTranslations } = useTranslation();
  const { patients, selectPatient, getSelectedPatient } = useDemoPatients();
  
  console.log('[MedicalAIDemo] Hooks called successfully');
  
  // Debug patient translations
  console.log('[MedicalAIDemo] Testing patient translations:', {
    'patient.info': t('patient.info'),
    'patient.view_full_history': t('patient.view_full_history'),
    'patient.medical_history': t('patient.medical_history')
  });
  
  // Check if patient translations are loaded
  console.log('[MedicalAIDemo] Patient translations loaded:', {
    hasTranslations: !!translations,
    patientKeys: Object.keys(translations || {}).filter(key => key.startsWith('patient.')),
    isLoadingTranslations,
    translationCount: Object.keys(translations || {}).length
  });
  
  // Log Whisper status on mount
  useEffect(() => {
    console.log('[MedicalAIDemo] Checking Whisper model status...');
    if (typeof window !== 'undefined') {
      console.log('[MedicalAIDemo] Global Whisper variables:', {
        workerInstance: !!global.__WHISPER_WORKER_INSTANCE__,
        modelLoaded: !!global.__WHISPER_MODEL_LOADED__,
        managerInitialized: !!global.__WHISPER_MANAGER_INITIALIZED__
      });
    }
  }, []);
  
  // Initialize state (moved localStorage to useEffect to prevent hydration mismatch)
  const [externalPatient, setExternalPatient] = useState(null);
  
  const [showPatientSelector, setShowPatientSelector] = useState(true);
  const steps = getMedicalWorkflowSteps(t);
  const [currentStep, setCurrentStep] = useState('escuchar');
  const [isRecording, setIsRecording] = useState(false);
  const [encounterTime] = useState('00:08:23');
  
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const patient = externalPatient || getSelectedPatient();

  // Load patient from localStorage after hydration
  useEffect(() => {
    const storedPatient = localStorage.getItem('medicalAIDemoPatient');
    if (storedPatient) {
      try {
        const parsed = JSON.parse(storedPatient);
        setExternalPatient(parsed);
        setShowPatientSelector(false);
      } catch (error) {
        console.error('Error parsing stored patient data:', error);
        localStorage.removeItem('medicalAIDemoPatient');
      }
    }
  }, []);

  // Clear localStorage after using it to prevent stale data
  useEffect(() => {
    if (externalPatient && typeof window !== 'undefined') {
      // Clear after a small delay to ensure component has fully initialized
      const timer = setTimeout(() => {
        localStorage.removeItem('medicalAIDemoPatient');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [externalPatient]);

  // No need for loading state since localStorage is synchronous
  
  // Show loading skeleton while translations are loading
  if (isLoadingTranslations) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/60">Loading translations...</p>
        </div>
      </div>
    );
  }
  
  if (showPatientSelector) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPatientSelector(false)}
                className="flex items-center text-foreground/70 hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                {t('demo.demo_title')}
              </button>
            </div>
            <DemoResetButton
              onReset={() => {
                selectPatient('');
                setExternalPatient(null);
                setShowPatientSelector(true);
                // Clear localStorage when resetting
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('medicalAIDemoPatient');
                }
              }}
            />
          </div>
        </header>

        <main className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="card-gradient glass dark:glass-dark rounded-xl shadow-lg border border-border p-6 animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center shadow-inner backdrop-blur-sm">
                  <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {t('demo.patient_selector')}
                  </h2>
                  <p className="text-sm text-foreground/60">
                    {t('demo.patient_selector_subtitle')}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {patients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => {
                      selectPatient(patient.id);
                      setShowPatientSelector(false);
                    }}
                    className="w-full text-left p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-smooth hover-scale"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">{patient.name}</div>
                        <div className="text-sm text-foreground/50">{patient.age} {t('years')}</div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{patient.gender}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <Link href="/contact" className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                  {t('demo.request_custom_demo')}
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  const CurrentComponent = steps[currentStepIndex].component;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Medical Header - María García Patient Context */}
      <header className="bg-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">{t('workflow.title')}</h1>
                <p className="text-sm text-foreground/60">{t('workflow.subtitle')}</p>
              </div>
            </div>
          </div>

          {/* Patient Context Header */}
          <div className="flex items-center gap-6">
            <div className="badge-modern border border-secondary/20">
              <User className="h-4 w-4 text-secondary" />
              <span className="font-medium text-foreground">
                {patient ? `${patient.name}, ${patient.age} ${t('years')}` : ''}
              </span>
            </div>
            <div className="badge-modern badge-success border border-green-300/30">
              <Clock className="h-4 w-4" />
              <span className="font-medium text-foreground">{encounterTime}</span>
            </div>
            <DemoResetButton
              onReset={() => {
                selectPatient('');
                setExternalPatient(null);
                setShowPatientSelector(true);
                // Clear localStorage when resetting
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('medicalAIDemoPatient');
                }
              }}
              className="mr-4"
            />
            <Button
              variant={isRecording ? "destructive" : "default"}
              onClick={() => setIsRecording(!isRecording)}
              className="flex items-center gap-2"
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isRecording ? t('workflow.actions.stop_recording') : t('workflow.actions.start_recording')}
            </Button>
          </div>
        </div>

        {/* Medical Workflow Steps Progress - EXACT Figma Design */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-foreground/60">{t('workflow.consultation_flow')}</h2>
            <div className="text-sm text-foreground/50">
              {t('workflow.step_of').replace('{current}', currentStepIndex + 1).replace('{total}', steps.length)}
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div key={step.id} className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-primary text-white' 
                        : isCompleted
                        ? 'text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                        : 'text-gray-600  hover:bg-gray-200  border border-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{step.label}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 ${
                      index < currentStepIndex ? 'bg-green-500' : 'bg-slate-300 dark:bg-gray-600'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          <Progress value={progress} className="h-2" />
        </div>
      </header>

      <div className="flex">
        {/* Professional Medical Navigation Sidebar */}
        <div className="w-80 bg-background border-r border-border min-h-screen">
          <div className="p-6">
            {/* Patient Information Panel */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-foreground mb-4">{t('patient.info')}</h3>
              <div className="card-float glass dark:glass-dark p-6 space-y-4">
                {/* Patient Header */}
                <div className="flex items-center gap-4 pb-4 border-b border-border/50">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm animate-float">
                    <User className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-foreground">{patient?.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="badge-modern badge-primary text-xs">
                        {patient?.age} {t('years')}
                      </span>
                      {patient?.gender && (
                        <span className="badge-modern text-xs">
                          {patient.gender}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                {patient?.medicalHistory && patient.medicalHistory.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>{t('patient.medical_history')}</span>
                    </div>
                    <div className="pl-6">
                      {patient.medicalHistory.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 py-1">
                          <div className="w-1.5 h-1.5 bg-primary/60 rounded-full"></div>
                          <span className="text-sm text-foreground/70">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="pt-3 flex gap-2">
                  <button className="flex-1 px-3 py-2 text-xs font-medium border rounded-lg hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-smooth">
                    {t('patient.view_full_history')}
                  </button>
                  <button className="px-3 py-2 text-xs font-medium border border-border text-foreground/70 rounded-lg hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-smooth">
                    <FileText className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Medical Navigation */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-foreground mb-4">{t('workflow.medical_navigation')}</h3>
              <nav className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 glass dark:glass-dark text-secondary rounded-lg border border-secondary/20 hover:border-secondary/40 transition-smooth hover-scale">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">{t('workflow.navigation.view_all_patients')}</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-foreground/70 rounded-lg hover:bg-muted/50 transition-smooth hover-scale">
                  <FolderOpen className="h-4 w-4" />
                  <span className="text-sm font-medium">{t('workflow.navigation.medical_reports')}</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-foreground/70 rounded-lg hover:bg-muted/50 transition-smooth hover-scale">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">{t('workflow.navigation.clinical_history')}</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-foreground/70 rounded-lg hover:bg-muted/50 transition-smooth hover-scale">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-medium">{t('workflow.navigation.new_consultation')}</span>
                </button>
              </nav>
            </div>

            {/* Current Step Status */}
            <div className="stat-card glass dark:glass-dark">
              <h3 className="text-sm font-semibold text-foreground mb-2">{t('workflow.current_step')}</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center shadow-inner">
                  {React.createElement(steps[currentStepIndex].icon, { className: "h-4 w-4 text-accent" })}
                </div>
                <span className="font-medium text-foreground">{steps[currentStepIndex].label}</span>
              </div>
              <div className="text-sm text-foreground/60">
                {currentStepIndex === 0 && t('workflow.step_descriptions.listen')}
                {currentStepIndex === 1 && t('workflow.step_descriptions.review')}
                {currentStepIndex === 2 && t('workflow.step_descriptions.notes')}
                {currentStepIndex === 3 && t('workflow.step_descriptions.orders')}
                {currentStepIndex === 4 && t('workflow.step_descriptions.summary')}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Medical Consultation Workspace */}
        <main className="flex-1 bg-background">
          <div className="p-8">
            <CurrentComponent 
              onNext={goToNextStep}
              onPrevious={goToPreviousStep}
              isRecording={isRecording}
              setIsRecording={setIsRecording}
            />
          </div>
        </main>
      </div>
      {/* Whisper Debug Panel (development only) <WhisperDebugPanel /> */}
    </div>
  );
}

export default MedicalAIDemo;
