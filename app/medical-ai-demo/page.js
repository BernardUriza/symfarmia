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
import { Mic, MicOff, Clock, User, Stethoscope, FileText, Users, FolderOpen, MessageSquare, Activity, ClipboardList, Download } from 'lucide-react';

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
  const steps = MedicalWorkflowSteps(t);
  const [currentStep, setCurrentStep] = useState('escuchar');
  const [isRecording, setIsRecording] = useState(false);
  const [encounterTime] = useState('00:08:23');
  
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
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
    <div className="min-h-screen bg-white">
      {/* Professional Medical Header - María García Patient Context */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">{t('workflow.title')}</h1>
                <p className="text-sm text-slate-600">{t('workflow.subtitle')}</p>
              </div>
            </div>
          </div>

          {/* Patient Context Header - EXACT Figma Design */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <User className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-slate-900">{t('workflow.patient.name')}, {t('workflow.patient.birth_date')}</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="font-medium text-slate-900">{encounterTime}</span>
            </div>
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
            <h2 className="text-sm font-medium text-slate-600">{t('workflow.consultation_flow')}</h2>
            <div className="text-sm text-slate-500">
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
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{step.label}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 ${
                      index < currentStepIndex ? 'bg-green-500' : 'bg-slate-300'
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
        <div className="w-80 bg-slate-50 border-r border-slate-200 min-h-screen">
          <div className="p-6">
            {/* Patient Information Panel */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">{t('workflow.patient_info')}</h3>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{t('workflow.patient.name')}</h4>
                    <p className="text-sm text-slate-600">{t('workflow.patient.age')} • {t('workflow.patient.gender')}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('workflow.patient.id')}:</span>
                    <span className="text-slate-900">12345678</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('workflow.patient.date')}:</span>
                    <span className="text-slate-900">{new Date().toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('workflow.patient.status')}:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {t('workflow.patient.status_stable')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Navigation */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">{t('workflow.medical_navigation')}</h3>
              <nav className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">{t('workflow.navigation.view_all_patients')}</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 rounded-lg hover:bg-white">
                  <FolderOpen className="h-4 w-4" />
                  <span className="text-sm font-medium">{t('workflow.navigation.medical_reports')}</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 rounded-lg hover:bg-white">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">{t('workflow.navigation.clinical_history')}</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 rounded-lg hover:bg-white">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-medium">{t('workflow.navigation.new_consultation')}</span>
                </button>
              </nav>
            </div>

            {/* Current Step Status */}
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">{t('workflow.current_step')}</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  {React.createElement(steps[currentStepIndex].icon, { className: "h-4 w-4 text-blue-600" })}
                </div>
                <span className="font-medium text-slate-900">{steps[currentStepIndex].label}</span>
              </div>
              <div className="text-sm text-slate-600">
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
        <main className="flex-1 bg-white">
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