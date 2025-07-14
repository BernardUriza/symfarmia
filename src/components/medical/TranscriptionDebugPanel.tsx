/**
 * TranscriptionDebugPanel - Debug component for speech recognition state
 * 
 * Shows real-time engine state, circuit breaker status, and error logs
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertCircle, Activity, Mic, MicOff, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface TranscriptionDebugPanelProps {
  engineState: any;
  error: any;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
}

export const TranscriptionDebugPanel: React.FC<TranscriptionDebugPanelProps> = ({
  engineState,
  error,
  isListening,
  transcript,
  interimTranscript
}) => {
  const [errorLog, setErrorLog] = useState<Array<{ time: string; error: any }>>([]);
  const [showDebug, setShowDebug] = useState(true);

  // Log errors
  useEffect(() => {
    if (error) {
      setErrorLog(prev => [...prev, {
        time: new Date().toLocaleTimeString(),
        error
      }].slice(-10)); // Keep last 10 errors
    }
  }, [error]);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-lg shadow-lg hover:bg-gray-700"
      >
        <Activity className="w-5 h-5" />
      </button>
    );
  }

  const getCircuitBreakerStatus = () => {
    if (!engineState.isCircuitBreakerOpen) {
      return { icon: CheckCircle, color: 'text-green-600', text: 'Cerrado' };
    }
    return { icon: XCircle, color: 'text-red-600', text: 'Abierto' };
  };

  const getListeningStatus = () => {
    if (isListening) {
      return { icon: Mic, color: 'text-green-600', text: 'Escuchando' };
    }
    return { icon: MicOff, color: 'text-gray-600', text: 'Detenido' };
  };

  const circuitBreaker = getCircuitBreakerStatus();
  const listening = getListeningStatus();

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[600px] overflow-hidden">
      <Card className="shadow-xl border-2 border-gray-300">
        <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
          <h3 className="font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Debug de Transcripción
          </h3>
          <button
            onClick={() => setShowDebug(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <CardContent className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
          {/* Estado del Motor */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">Estado del Motor</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <listening.icon className={`w-4 h-4 ${listening.color}`} />
                <span>{listening.text}</span>
              </div>
              <div className="flex items-center gap-2">
                <circuitBreaker.icon className={`w-4 h-4 ${circuitBreaker.color}`} />
                <span>CB: {circuitBreaker.text}</span>
              </div>
            </div>
          </div>

          {/* Métricas */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">Métricas</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-100 p-2 rounded">
                <span className="text-gray-600">Errores consecutivos:</span>
                <span className="ml-2 font-mono">{engineState.consecutiveErrors || 0}</span>
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <span className="text-gray-600">Reintentos:</span>
                <span className="ml-2 font-mono">{engineState.retryCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Sesión Actual */}
          {engineState.currentSession && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700">Sesión Actual</h4>
              <div className="bg-blue-50 p-2 rounded text-sm">
                <div>ID: {engineState.currentSession.id}</div>
                <div>Duración: {Math.round(engineState.currentSession.duration / 1000)}s</div>
              </div>
            </div>
          )}

          {/* Transcripción Actual */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">Transcripción</h4>
            <div className="bg-gray-50 p-2 rounded text-sm max-h-32 overflow-y-auto">
              {transcript || <span className="text-gray-400">Sin transcripción</span>}
              {interimTranscript && (
                <span className="text-gray-500 italic"> {interimTranscript}</span>
              )}
            </div>
          </div>

          {/* Error Actual */}
          {error && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Error Actual
              </h4>
              <div className="bg-red-50 p-2 rounded text-sm">
                <div className="font-mono text-red-800">{error.error}</div>
                <div className="text-red-600">{error.message}</div>
                <Badge variant={error.recoverable ? 'warning' : 'destructive'} className="mt-1">
                  {error.recoverable ? 'Recuperable' : 'Crítico'}
                </Badge>
              </div>
            </div>
          )}

          {/* Log de Errores */}
          {errorLog.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Historial de Errores
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {errorLog.map((log, index) => (
                  <div key={index} className="text-xs bg-gray-100 p-1 rounded flex justify-between">
                    <span className="text-gray-600">{log.time}</span>
                    <span className="font-mono text-red-600">{log.error.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estado Completo (expandible) */}
          <details className="text-sm">
            <summary className="cursor-pointer font-semibold text-gray-700">
              Estado Completo del Motor
            </summary>
            <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
              {JSON.stringify(engineState, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranscriptionDebugPanel;