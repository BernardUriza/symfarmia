"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  User, 
  Clock, 
  Save, 
  CheckCircle,
  Mic
} from 'lucide-react';
import { ActionButton } from '@/src/components/ui';
import { UserPlusIcon } from '@heroicons/react/24/outline';
// import { TranscriptionPanel } from '@/src/domains/medical-ai/components/TranscriptionPanel';
import { useTranslation } from '@/src/providers/I18nProvider';
import ThemeToggle from '@/src/components/layout/ThemeToggle';

interface Patient {
  id: string;
  name: string;
  age: number;
  lastVisit: string;
}

interface ConsultationState {
  patientId: string | null;
  patientName: string;
  transcriptionText: string;
  status: 'idle' | 'recording' | 'completed' | 'saved';
  duration: number;
  autoSaveEnabled: boolean;
  lastSaved: Date | null;
}

const ConsultationPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [consultationState, setConsultationState] = useState<ConsultationState>({
    patientId: null,
    patientName: '',
    transcriptionText: '',
    status: 'idle',
    duration: 0,
    autoSaveEnabled: true,
    lastSaved: null
  });

  // Demo patients - in real app, fetch from API
  const [patients] = useState<Patient[]>([
    { id: '1', name: 'María García López', age: 45, lastVisit: '2024-01-15' },
    { id: '2', name: 'Juan Carlos Rodríguez', age: 62, lastVisit: '2024-01-10' },
    { id: '3', name: 'Ana Patricia Morales', age: 28, lastVisit: '2024-01-08' },
    { id: '4', name: 'Roberto Silva Medina', age: 35, lastVisit: '2024-01-05' },
    { id: '5', name: 'Carmen Elena Vásquez', age: 51, lastVisit: '2024-01-03' }
  ]);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientSelector, setShowPatientSelector] = useState(true);

  // Timer for consultation duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (consultationState.status === 'recording') {
      interval = setInterval(() => {
        setConsultationState(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [consultationState.status]);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = async () => {
      if (!selectedPatient || !consultationState.transcriptionText) return;
      
      try {
        // In real app, save to API
        console.log('Auto-saving consultation:', {
          patientId: selectedPatient.id,
          transcription: consultationState.transcriptionText,
          timestamp: new Date()
        });
        
        setConsultationState(prev => ({
          ...prev,
          lastSaved: new Date()
        }));
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    };

    let autoSaveInterval: NodeJS.Timeout;
    if (consultationState.autoSaveEnabled && consultationState.transcriptionText.length > 0) {
      autoSaveInterval = setInterval(() => {
        autoSave();
      }, 30000); // Auto-save every 30 seconds
    }
    return () => clearInterval(autoSaveInterval);
  }, [consultationState.autoSaveEnabled, consultationState.transcriptionText, selectedPatient]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setConsultationState(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.name
    }));
    setShowPatientSelector(false);
  };



  const handleSaveConsultation = async () => {
    if (!selectedPatient || !consultationState.transcriptionText) return;
    
    try {
      // In real app, save to API and create medical report
      console.log('Saving consultation:', {
        patientId: selectedPatient.id,
        transcription: consultationState.transcriptionText,
        duration: consultationState.duration,
        timestamp: new Date()
      });
      
      setConsultationState(prev => ({
        ...prev,
        status: 'saved',
        lastSaved: new Date()
      }));
      
      // Redirect to medical reports after save
      setTimeout(() => {
        router.push('/dashboard/medicalReports');
      }, 2000);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showPatientSelector) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center text-foreground/70 hover:text-foreground">
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t('navigation.dashboard')}
          </Link>
              <div className="w-px h-6 bg-border"></div>
              <h1 className="text-xl font-semibold text-foreground">{t('consultation.page.title')}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-foreground/60">
                <Mic className="h-4 w-4 text-emerald-600" />
                {t('consultation.page.subtitle')}
              </div>
              <div className="w-px h-6 bg-border"></div>
            </div>
          </div>
        </header>

        {/* Patient Selection */}
        <main className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-background rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{t('consultation.patient_selector.title')}</h2>
                  <p className="text-sm text-foreground/60">{t('consultation.patient_selector.subtitle')}</p>
                </div>
              </div>

              <div className="space-y-3">
                {patients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient)}
                    className="w-full text-left p-4 border border-border rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">{patient.name}</div>
                        <div className="text-sm text-foreground/50">{patient.age} años</div>
                      </div>
                      <div className="text-sm text-foreground/50">
                        Última visita: {patient.lastVisit}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <ActionButton
                  onClick={() => router.push('/dashboard/patients')}
                  text={t('consultation.patient_selector.add_new')}
                  icon={UserPlusIcon}
                  color="emerald"
                  size="md"
                  variant="outline"
                  fullWidth={true}
                  ariaLabel="Add new patient to the system"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPatientSelector(true)}
                  className="flex items-center text-foreground/70 hover:text-foreground"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  {t('consultation.buttons.change_patient')}
                </button>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{selectedPatient?.name}</h1>
                <p className="text-sm text-foreground/60">{selectedPatient?.age} años</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Duration */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              {formatDuration(consultationState.duration)}
            </div>
            
            {/* Theme Toggle */}
            <div className="w-px h-6 bg-border"></div>
            <ThemeToggle className="ml-2" />
            
            {/* Auto-save status */}
            {consultationState.lastSaved && (
              <div className="flex items-center gap-2 text-sm text-foreground/60">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Auto-guardado
              </div>
            )}
            
            {/* Status */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              consultationState.status === 'idle' ? 'bg-gray-100 text-gray-700' :
              consultationState.status === 'recording' ? 'bg-green-100 text-green-700' :
              consultationState.status === 'completed' ? 'bg-blue-100 text-blue-700' :
              'bg-emerald-100 text-emerald-700'
            }`}>
              {consultationState.status === 'idle' && 'Lista'}
              {consultationState.status === 'recording' && 'Grabando'}
              {consultationState.status === 'completed' && 'Completada'}
              {consultationState.status === 'saved' && 'Guardada'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Consultation Info */}
          <div className="bg-background rounded-lg shadow-sm border border-border p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-foreground/60">
                  <span className="font-medium">Consulta:</span> {new Date().toLocaleDateString()}
                </div>
                <div className="text-sm text-foreground/60">
                  <span className="font-medium">Duración:</span> {formatDuration(consultationState.duration)}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConsultationState(prev => ({ ...prev, autoSaveEnabled: !prev.autoSaveEnabled }))}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    consultationState.autoSaveEnabled 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Auto-guardar {consultationState.autoSaveEnabled ? 'ON' : 'OFF'}
                </button>
                
                {consultationState.status === 'completed' && (
                <button
                  onClick={handleSaveConsultation}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {t('consultation.buttons.save_consultation')}
                </button>
                )}
              </div>
            </div>
          </div>

          {/* Transcription Panel (deprecated) */}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">{t('consultation.actions.quick_actions')}</h3>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                {t('consultation.actions.template_general')}
              </button>
              <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                {t('consultation.actions.template_followup')}
              </button>
              <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                {t('consultation.actions.template_chest_pain')}
              </button>
              <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                {t('consultation.actions.export_pdf')}
              </button>
            </div>
          </div>

          {/* Success Message */}
          {consultationState.status === 'saved' && (
            <div className="fixed top-4 right-4 bg-emerald-100 border border-emerald-200 rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span className="text-emerald-800 font-medium">
                {t('consultation.status.saved_success')}
              </span>
              </div>
              <p className="text-emerald-700 text-sm mt-1">
                {t('consultation.status.redirect_notice')}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ConsultationPage;
