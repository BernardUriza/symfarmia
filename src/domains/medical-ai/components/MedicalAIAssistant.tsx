import React, { useState } from 'react';
import { MedicalAnalysis, TranscriptionResult, TranscriptionStatus } from '../types';
import { useMedicalAI } from '../hooks/useMedicalAI';

interface MedicalAIAssistantProps {
  patientId?: string;
  onAnalysisComplete?: (analysis: MedicalAnalysis) => void;
}

export const MedicalAIAssistant = ({ 
  patientId, 
  onAnalysisComplete: _onAnalysisComplete 
}: MedicalAIAssistantProps) => {
  const { analyzeMedicalContent, loading } = useMedicalAI();
  const [input, setInput] = useState('');
  const [_analysis, _setAnalysis] = useState<MedicalAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;

    const transcription: TranscriptionResult = {
      id: `trans-${Date.now()}`,
      sessionId: `session-${Date.now()}`,
      text: input,
      fullText: input,
      duration: 0,
      engine: 'manual',
      confidence: 1.0,
      timestamp: new Date(),
      createdAt: new Date(),
      language: 'es',
      medicalTerms: [],
      segments: [],
      status: TranscriptionStatus.COMPLETED
    };

    await analyzeMedicalContent(transcription, {
      patientId,
      practitionerId: 'default-practitioner',
      consultationId: `consult-${Date.now()}`,
      specialty: 'general',
      appointmentType: 'consultation',
      language: 'es',
      urgencyLevel: 'routine'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Asistente Médico AI
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe los síntomas del paciente
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Ej: Paciente presenta dolor de cabeza intenso, fiebre de 38.5°C..."
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !input.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Analizando...' : 'Analizar síntomas'}
        </button>

        {analysis && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Análisis AI</h4>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Síntomas detectados:</span>
                <ul className="mt-1 list-disc list-inside text-gray-600">
                  {analysis.analysis?.symptoms.map((symptom, idx) => (
                    <li key={idx}>{symptom}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-medium text-gray-700">Posibles diagnósticos:</span>
                <ul className="mt-1 list-disc list-inside text-gray-600">
                  {analysis.analysis?.potentialDiagnoses.map((diagnosis, idx) => (
                    <li key={idx}>{diagnosis}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-medium text-gray-700">Acciones recomendadas:</span>
                <ul className="mt-1 list-disc list-inside text-gray-600">
                  {analysis.analysis?.recommendedActions.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <span className="text-xs text-gray-500">
                  Urgencia: <span className="font-medium">{analysis.analysis?.urgencyLevel}</span>
                </span>
                <span className="text-xs text-gray-500">
                  Especialidad: <span className="font-medium">{analysis.analysis?.specialty}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};