"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Users, 
  FileText, 
  Calendar, 
  ArrowRight, 
  CheckCircle, 
  Clock,
  Plus,
  BookOpen
} from 'lucide-react';
import PatientQuickSearch from './PatientQuickSearch';
import NewPatientModal from './NewPatientModal';

const WorkflowStep = ({ 
  step, 
  title, 
  description, 
  icon: Icon, 
  status = 'pending', 
  onClick,
  isActive = false 
}) => {
  const statusStyles = {
    pending: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    active: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500',
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    in_progress: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
  };

  return (
    <div 
      className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${statusStyles[status]}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-white bg-opacity-20 flex items-center justify-center">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">{title}</h4>
            <p className="text-xs opacity-80">{description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {status === 'completed' && <CheckCircle className="h-4 w-4" />}
          {status === 'active' && <Clock className="h-4 w-4" />}
          {status === 'pending' && <span className="text-xs font-medium">PASO {step}</span>}
        </div>
      </div>
      {isActive && (
        <div className="mt-2 pt-2 border-t border-current opacity-50">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">ACTIVO</span>
          </div>
        </div>
      )}
    </div>
  );
};

const PatientWorkflow = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isSavingPatient, setIsSavingPatient] = useState(false);
  const [, setWorkflowData] = useState({
    patient: null,
    consultation: null,
    documentation: null,
    followUp: null
  });

  const steps = [
    {
      id: 1,
      title: 'Buscar Paciente',
      description: 'Localizar o registrar paciente',
      icon: Search,
      component: 'search'
    },
    {
      id: 2,
      title: 'Iniciar Consulta',
      description: 'Comenzar sesión médica',
      icon: Users,
      component: 'consultation'
    },
    {
      id: 3,
      title: 'Generar Nota',
      description: 'Documentar diagnóstico',
      icon: FileText,
      component: 'documentation'
    },
    {
      id: 4,
      title: 'Programar Seguimiento',
      description: 'Agendar próxima cita',
      icon: Calendar,
      component: 'schedule'
    }
  ];

  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  const handleStepClick = (stepId) => {
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setWorkflowData(prev => ({ ...prev, patient }));
    nextStep();
  };

  const handleNewPatientClick = () => {
    setIsNewPatientModalOpen(true);
  };

  const handleSaveNewPatient = async (patientData) => {
    setIsSavingPatient(true);
    try {
      // TODO: Implement actual API call to save patient
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock patient object with an ID
      const newPatient = {
        id: `PAT-${Date.now()}`,
        ...patientData
      };
      
      // Select the newly created patient
      setSelectedPatient(newPatient);
      setWorkflowData(prev => ({ ...prev, patient: newPatient }));
      
      // Close modal and move to next step
      setIsNewPatientModalOpen(false);
      nextStep();
      
      // Show success notification (you can implement toast here)
      console.log('Patient saved successfully:', newPatient);
    } catch (error) {
      console.error('Error saving patient:', error);
      // Show error notification
    } finally {
      setIsSavingPatient(false);
    }
  };

  const handleCloseNewPatientModal = () => {
    setIsNewPatientModalOpen(false);
  };

  const handleConsultaGeneral = () => {
    if (selectedPatient) {
      const patientData = {
        id: selectedPatient.id,
        name: selectedPatient.name,
        age: selectedPatient.age || 'N/A',
        gender: selectedPatient.gender || 'N/A',
        medicalHistory: selectedPatient.medicalHistory || []
      };
      
      router.push(`/medical-ai-demo?bypass=true&patientData=${encodeURIComponent(JSON.stringify(patientData))}&type=general`);
    } else {
      router.push('/medical-ai-demo');
    }
  };

  const handleConsultaUrgente = () => {
    if (selectedPatient) {
      const patientData = {
        id: selectedPatient.id,
        name: selectedPatient.name,
        age: selectedPatient.age || 'N/A',
        gender: selectedPatient.gender || 'N/A',
        medicalHistory: selectedPatient.medicalHistory || []
      };
      
      router.push(`/medical-ai-demo?bypass=true&patientData=${encodeURIComponent(JSON.stringify(patientData))}&type=urgent`);
    } else {
      router.push('/medical-ai-demo');
    }
  };

  const PatientSearchStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Paso 1: Buscar Paciente
        </h3>
        <button 
          onClick={handleNewPatientClick}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Paciente</span>
        </button>
      </div>
      
      <PatientQuickSearch onPatientSelect={handlePatientSelect} />
      
      {selectedPatient && (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-200">
                Paciente Seleccionado
              </h4>
              <p className="text-sm text-green-600 dark:text-green-300">
                {selectedPatient.name} - {selectedPatient.id}
              </p>
            </div>
            <button 
              onClick={nextStep}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const ConsultationStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Paso 2: Iniciar Consulta
      </h3>
      
      {selectedPatient && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200">
                Consulta para: {selectedPatient.name}
              </h4>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Historial médico disponible
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-600 dark:text-blue-400">Ver Historial</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={handleConsultaGeneral} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Consulta General</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Revisión rutinaria</div>
            </button>
            
            <button onClick={handleConsultaUrgente} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/40 transition-colors">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Consulta Urgente</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Atención prioritaria</div>
            </button>
            
            <button 
              onClick={nextStep}
              className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <div className="text-sm font-medium">Seguimiento</div>
              <div className="text-xs opacity-90">Continuar tratamiento</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const DocumentationStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Paso 3: Generar Nota Médica
      </h3>
      
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Motivo de Consulta
            </label>
            <textarea 
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              rows="3"
              placeholder="Describe el motivo de la consulta..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Diagnóstico
            </label>
            <textarea 
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              rows="3"
              placeholder="Diagnóstico médico..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tratamiento Prescrito
            </label>
            <textarea 
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              rows="3"
              placeholder="Tratamiento y medicación..."
            />
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={nextStep}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Guardar Nota
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ScheduleStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Paso 4: Programar Seguimiento
      </h3>
      
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de Seguimiento
            </label>
            <input 
              type="date" 
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Cita
            </label>
            <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option>Consulta de Seguimiento</option>
              <option>Revisión de Resultados</option>
              <option>Control de Tratamiento</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between">
          <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
            Sin Seguimiento
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Programar Cita
          </button>
        </div>
      </div>
      
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          <div>
            <h4 className="font-medium text-green-800 dark:text-green-200">
              Flujo de Trabajo Completo
            </h4>
            <p className="text-sm text-green-600 dark:text-green-300">
              Consulta procesada exitosamente
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <PatientSearchStep />;
      case 2:
        return <ConsultationStep />;
      case 3:
        return <DocumentationStep />;
      case 4:
        return <ScheduleStep />;
      default:
        return <PatientSearchStep />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Workflow Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Flujo de Trabajo del Paciente
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Paso {currentStep} de {steps.length}</span>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Steps Progress */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <WorkflowStep
                step={step.id}
                title={step.title}
                description={step.description}
                icon={step.icon}
                status={getStepStatus(step.id)}
                onClick={() => handleStepClick(step.id)}
                isActive={step.id === currentStep}
              />
              {index < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-400 mx-2 hidden md:block" />
              )}
            </div>
          ))}
        </div>
        
        {/* Current Step Content */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          {renderCurrentStep()}
        </div>
      </div>
      
      {/* New Patient Modal */}
      <NewPatientModal 
        isOpen={isNewPatientModalOpen}
        onClose={handleCloseNewPatientModal}
        onSave={handleSaveNewPatient}
        isLoading={isSavingPatient}
      />
    </div>
  );
};

export default PatientWorkflow;