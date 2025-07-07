"use client";

import React, { useState } from 'react';
import { ConversationCapture } from '../components/medical/ConversationCapture';
import { ClinicalNotes } from '../components/medical/ClinicalNotes';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Mic, MicOff, Clock, User, Stethoscope, FileText, ClipboardList, Download, Menu } from 'lucide-react';

const steps = [
  { id: 'capture', label: 'Escuchar', icon: Mic, component: ConversationCapture },
  { id: 'notes', label: 'Notas', icon: FileText, component: ClinicalNotes },
];

export default function MedicalAIDemo() {
  const [currentStep, setCurrentStep] = useState('capture');
  const [isRecording, setIsRecording] = useState(false);
  const [encounterTime, setEncounterTime] = useState('00:08:23');
  
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const CurrentComponent = steps[currentStepIndex].component;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación Superior */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl text-slate-900">Escriba Médica IA - Demo</h1>
            </div>
          </div>

          {/* Información del Paciente */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              <span className="text-slate-700">María García, FN: 15/03/1985</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="text-slate-700">{encounterTime}</span>
            </div>
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="sm"
              onClick={() => setIsRecording(!isRecording)}
              className="flex items-center gap-2"
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isRecording ? 'Detener' : 'Grabar'}
            </Button>
          </div>
        </div>

        {/* Barra de Progreso */}
        <div className="mt-3">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <span
                key={step.id}
                className={`text-xs ${index <= currentStepIndex ? 'text-blue-600' : 'text-slate-400'}`}
              >
                {step.label}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Barra Lateral */}
        <div className="hidden md:block w-64 bg-white border-r border-slate-200">
          <div className="p-4">
            <h2 className="text-sm text-slate-500 mb-4">Pasos del Flujo</h2>
            <nav className="space-y-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = index < currentStepIndex;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive 
                        ? 'bg-blue-100 text-blue-700'
                        : isCompleted
                        ? 'text-green-700 hover:bg-green-50'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{step.label}</span>
                    {isCompleted && (
                      <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700">
                        ✓
                      </Badge>
                    )}
                    {isActive && (
                      <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-700">
                        Activo
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Contenido Principal */}
        <main className="flex-1 p-6 transition-all duration-200">
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
        </main>
      </div>
    </div>
  );
}