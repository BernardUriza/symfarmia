const fs = require('fs');

const fixPatientWorkflow = () => {
  console.log('Fixing PatientWorkflow.jsx...');
  
  const content = `"use client";

import React, { useState, useTransition, useEffect, useCallback } from 'react';
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
    pending: 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600',
    active: 'bg-gradient-to-br from-medical-primary/10 to-medical-accent/10 text-medical-primary ring-2 ring-medical-primary/50',
    completed: 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-600',
    in_progress: 'bg-gradient-to-br from-yellow-100 to-amber-100 text-yellow-600'
  };

  return (
    <div className="group perspective-1000">
      <div
        className={\`p-4 rounded-2xl border-2 transition-all duration-500 hover:shadow-xl cursor-pointer transform-3d hover:translate-z-4 hover:scale-[1.02] hover:-rotate-y-1 backdrop-blur-sm \${statusStyles[status]} relative overflow-hidden\`}
        onClick={onClick}
      >
        {/* Shimmer overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
        
        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm shadow-inner flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm group-hover:text-medical-primary transition-colors duration-300">
                {title}
              </h4>
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
          <div className="mt-2 pt-2 border-t border-current/30 relative z-10">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gradient-to-r from-medical-primary to-medical-accent rounded-full animate-pulse"></div>
              <span className="text-xs font-medium bg-gradient-to-r from-medical-primary to-medical-accent bg-clip-text text-transparent">
                ACTIVO
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PatientWorkflow = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isSavingPatient, setIsSavingPatient] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [, setWorkflowData] = useState({
    patient: null,
    consultation: null,
    documentation: null,
    followUp: null
  });

  // Prefetch medical-ai-demo page to avoid compilation delay
  useEffect(() => {
    // Prefetch the medical-ai-demo page when component mounts
    router.prefetch('/medical-ai-demo');
  }, [router]);

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
      setIsTransitioning(true);
      startTransition(() => {
        setTimeout(() => {
          setCurrentStep(stepId);
          setIsTransitioning(false);
        }, 150);
      });
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePatientSelect = (patient) => {
    // Add smooth transition effect
    setIsTransitioning(true);
    startTransition(() => {
      setSelectedPatient(patient);
      setWorkflowData(prev => ({ ...prev, patient }));
      
      // Delay the step change to allow for smooth visual transition
      setTimeout(() => {
        nextStep();
        setIsTransitioning(false);
        // Smooth scroll to top of workflow
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    });
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
        id: \`PAT-\${Date.now()}\`,
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

  const navigateToMedicalDemo = useCallback((consultationType) => {
    if (selectedPatient) {
      const patientData = {
        id: selectedPatient.id,
        name: selectedPatient.name,
        age: selectedPatient.age || 'N/A',
        gender: selectedPatient.gender || 'N/A',
        medicalHistory: selectedPatient.medicalHistory || [],
        consultationType
      };
      
      // Store patient data in localStorage
      localStorage.setItem('medicalAIDemoPatient', JSON.stringify(patientData));
    }
    
    // Use router.push with a proper transition
    setIsTransitioning(true);
    
    // Use startTransition to make navigation non-blocking
    startTransition(() => {
      // Double requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          router.push('/medical-ai-demo');
        });
      });
    });
  }, [selectedPatient, router, startTransition]);

  const PatientSearchStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
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
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-green-800">
                Paciente Seleccionado
              </h4>
              <p className="text-sm text-green-600">
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
      <h3 className="text-lg font-semibold text-gray-900">
        Paso 2: Iniciar Consulta
      </h3>
      
      {selectedPatient && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-blue-800">
                Consulta para: {selectedPatient.name}
              </h4>
              <p className="text-sm text-blue-600">
                Historial médico disponible
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-600">Ver Historial</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigateToMedicalDemo('general')}
              disabled={isTransitioning}
              className="p-3 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors text-left w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-sm font-medium text-gray-900">Consulta General</div>
              <div className="text-xs text-gray-500">Revisión rutinaria</div>
            </button>
            
            <button
              onClick={() => navigateToMedicalDemo('urgent')}
              disabled={isTransitioning}
              className="p-3 bg-white rounded-lg border border-yellow-200 hover:bg-yellow-50 transition-colors text-left w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-sm font-medium text-gray-900">Consulta Urgente</div>
              <div className="text-xs text-gray-500">Atención prioritaria</div>
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
      <h3 className="text-lg font-semibold text-gray-900">
        Paso 3: Generar Nota Médica
      </h3>
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de Consulta
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900"
              rows="3"
              placeholder="Describe el motivo de la consulta..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnóstico
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900"
              rows="3"
              placeholder="Diagnóstico médico..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tratamiento Prescrito
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900"
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
      <h3 className="text-lg font-semibold text-gray-900">
        Paso 4: Programar Seguimiento
      </h3>
      
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Seguimiento
            </label>
            <input
              type="date"
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Cita
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900">
              <option>Consulta de Seguimiento</option>
              <option>Revisión de Resultados</option>
              <option>Control de Tratamiento</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between">
          <button className="text-gray-600 hover:text-gray-800">
            Sin Seguimiento
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Programar Cita
          </button>
        </div>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div>
            <h4 className="font-medium text-green-800 ">
              Flujo de Trabajo Completo
            </h4>
            <p className="text-sm text-green-600 ">
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
    <div className={\`max-w-4xl mx-auto space-y-6 \${isTransitioning ? 'pointer-events-none' : ''}\`}>
      {/* Workflow Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Flujo de Trabajo del Paciente
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
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
        <div className="border-t border-gray-200 pt-6 relative min-h-[400px]">
          {/* Loading overlay during transitions */}
          {(isTransitioning || isPending) && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
          
          {/* Fade transition wrapper */}
          <div className={\`transition-all duration-300 \${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}\`}>
            {renderCurrentStep()}
          </div>
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

export default PatientWorkflow;`;

  fs.writeFileSync('/workspaces/symfarmia/src/components/patient/PatientWorkflow.jsx', content, 'utf8');
  console.log('✅ Fixed PatientWorkflow.jsx');
};

// Main function
const main = () => {
  console.log('🔧 Fixing PatientWorkflow.jsx...\n');
  
  fixPatientWorkflow();
  
  console.log('\n✅ File fixed!');
};

main();