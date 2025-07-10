"use client";

import React, { useState } from 'react';
import { useTranslation } from '../providers/I18nProvider';
import { ConversationCapture } from '../components/medical/ConversationCapture';
import { DialogueFlow } from '../components/medical/DialogueFlow';
import { ClinicalNotes } from '../components/medical/ClinicalNotes';
import { OrderEntry } from '../components/medical/OrderEntry';
import { SummaryExport } from '../components/medical/SummaryExport';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Mic, MicOff, Clock, User, ArrowLeft, Stethoscope, FileText, Users, FolderOpen, MessageSquare, Activity, ClipboardList, Download } from 'lucide-react';
import Link from 'next/link';
import { DemoResetButton } from '../../src/domains/demo';
import { useDemoPatients } from '../../src/domains/demo/hooks/useDemoPatients';

// EXACT Figma workflow steps as specified
const MedicalWorkflowSteps = (t) => ([
  { id: 'escuchar', label: t('workflow.steps.listen'), icon: Mic, component: ConversationCapture },
  { id: 'revisar', label: t('workflow.steps.review'), icon: MessageSquare, component: DialogueFlow },
  { id: 'notas', label: t('workflow.steps.notes'), icon: FileText, component: ClinicalNotes },
  { id: 'ordenes', label: t('workflow.steps.orders'), icon: ClipboardList, component: OrderEntry },
  { id: 'resumen', label: t('workflow.steps.summary'), icon: Download, component: SummaryExport },
]);

export default function MedicalAIDemo() {
  const { t } = useTranslation();
  const { patients, selectedPatient, loading, selectPatient, getSelectedPatient } = useDemoPatients();
  const [showPatientSelector, setShowPatientSelector] = useState(true);
  const steps = MedicalWorkflowSteps(t);
  const [currentStep, setCurrentStep] = useState('escuchar');
  const [isRecording, setIsRecording] = useState(false);
  const [encounterTime] = useState('00:08:23');
  
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const patient = getSelectedPatient();

  if (showPatientSelector) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPatientSelector(false)}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                {t('demo.demo_title')}
              </button>
            </div>
            <DemoResetButton
              onReset={() => {
                selectPatient('');
                setShowPatientSelector(true);
              }}
            />
          </div>
        </header>

        <main className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('demo.patient_selector')}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
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
                    className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{patient.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{patient.age} años</div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{patient.gender}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Professional Medical Header - María García Patient Context */}
      <header className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{t('workflow.title')}</h1>
                <p className="text-sm text-slate-600 dark:text-gray-400">{t('workflow.subtitle')}</p>
              </div>
            </div>
          </div>

          {/* Patient Context Header */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-slate-900 dark:text-white">
                {patient ? `${patient.name}, ${patient.age} años` : ''}
              </span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="font-medium text-slate-900 dark:text-white">{encounterTime}</span>
            </div>
            <DemoResetButton
              onReset={() => {
                selectPatient('');
                setShowPatientSelector(true);
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
            <h2 className="text-sm font-medium text-slate-600 dark:text-gray-400">{t('workflow.consultation_flow')}</h2>
            <div className="text-sm text-slate-500 dark:text-gray-400">
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
                        ? 'bg-blue-600 text-white' 
                        : isCompleted
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                        : 'bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-600'
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
        <div className="w-80 bg-slate-50 dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 min-h-screen">
          <div className="p-6">
            {/* Patient Information Panel */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Información del Paciente</h3>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-slate-200 dark:border-gray-600">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{patient?.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-gray-400">{patient?.age} años</p>
                  </div>
                </div>
                {patient?.gender && (
                  <div className="text-sm text-slate-600 dark:text-gray-400 mb-2">{patient.gender}</div>
                )}
                {patient?.medicalHistory && patient.medicalHistory.length > 0 && (
                  <div className="text-sm text-slate-600 dark:text-gray-400">
                    <span className="font-medium">Historial:</span> {patient.medicalHistory.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Medical Navigation */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{t('workflow.medical_navigation')}</h3>
              <nav className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-700">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">{t('workflow.navigation.view_all_patients')}</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-700">
                  <FolderOpen className="h-4 w-4" />
                  <span className="text-sm font-medium">{t('workflow.navigation.medical_reports')}</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-700">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">{t('workflow.navigation.clinical_history')}</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-700">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-medium">{t('workflow.navigation.new_consultation')}</span>
                </button>
              </nav>
            </div>

            {/* Current Step Status */}
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-slate-200 dark:border-gray-600">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{t('workflow.current_step')}</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  {React.createElement(steps[currentStepIndex].icon, { className: "h-4 w-4 text-blue-600 dark:text-blue-400" })}
                </div>
                <span className="font-medium text-slate-900 dark:text-white">{steps[currentStepIndex].label}</span>
              </div>
              <div className="text-sm text-slate-600 dark:text-gray-400">
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
        <main className="flex-1 bg-white dark:bg-gray-900">
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
    </div>
  );
}
