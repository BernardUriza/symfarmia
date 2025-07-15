/**
 * Example: Using the enhanced transcription system with circuit breaker
 * 
 * This example shows how to use the new transcription components that
 * include circuit breaker protection and manual fallback
 */

import React from 'react';
import { ConversationCaptureEnhanced } from '../components/medical/ConversationCaptureEnhanced';

export default function TranscriptionWithCircuitBreakerExample() {
  const handleTranscriptionComplete = (transcript: string) => {
    console.log('Transcription completed:', transcript);
    // Here you would typically:
    // 1. Save the transcription to your database
    // 2. Send it for AI analysis
    // 3. Navigate to the next step
  };

  const handleNext = () => {
    console.log('Moving to next step...');
    // Navigate to the next page or step in your workflow
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Sistema de Transcripción Médica
        </h1>
        
        <ConversationCaptureEnhanced
          onTranscriptionComplete={handleTranscriptionComplete}
          onNext={handleNext}
          showDebug={process.env.NODE_ENV === 'development'} // Show debug in development
        />
        
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              Características del Sistema:
            </h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
              <li>Circuit breaker automático que previene bloqueos permanentes</li>
              <li>Recuperación automática de errores transitorios</li>
              <li>Modo manual de respaldo para cuando falla el reconocimiento de voz</li>
              <li>Panel de debug para monitorear el estado del motor en tiempo real</li>
              <li>Manejo inteligente de errores críticos vs recuperables</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Alternative: Using the hook directly for custom UI
import { useTranscription } from '../domains/medical-ai/hooks/useTranscription';

export function CustomTranscriptionUI() {
  const {
    isListening,
    transcript,
    error,
    startTranscription,
    stopTranscription,
    isManualMode,
    manualTranscript,
    setManualTranscript,
    enableManualMode
  } = useTranscription({
    debug: true,
    onError: (error) => {
      // Custom error handling
      if (!error.recoverable) {
        // Show notification to user
        alert(`Error crítico: ${error.message}`);
      }
    }
  });

  return (
    <div className="p-4">
      {/* Custom UI implementation */}
      {error && !error.recoverable && (
        <div className="bg-red-100 p-3 rounded mb-4">
          <p>{error.message}</p>
          {!isManualMode && (
            <button 
              onClick={enableManualMode}
              className="mt-2 bg-red-600 text-white px-3 py-1 rounded"
            >
              Usar modo manual
            </button>
          )}
        </div>
      )}

      {isManualMode ? (
        <textarea
          value={manualTranscript}
          onChange={(e) => setManualTranscript(e.target.value)}
          className="w-full p-2 border rounded"
          rows={5}
          placeholder="Escribe aquí..."
        />
      ) : (
        <div>
          <button
            onClick={isListening ? stopTranscription : startTranscription}
            className={`px-4 py-2 rounded ${
              isListening ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
            }`}
          >
            {isListening ? 'Detener' : 'Iniciar'} Grabación
          </button>
          
          {transcript && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              {transcript}
            </div>
          )}
        </div>
      )}
    </div>
  );
}