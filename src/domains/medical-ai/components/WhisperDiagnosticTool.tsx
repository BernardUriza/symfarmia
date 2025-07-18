"use client";
import { useState, useEffect, useRef } from 'react';
import { whisperModelCache } from '../services/whisperModelCache';
import { whisperPreloadManager } from '../services/WhisperPreloadManager';
import { audioPipelineIntegration } from '../services/AudioPipelineIntegration';
import { useSimpleWhisperHybrid } from '../hooks/useSimpleWhisperHybrid';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: any;
  timestamp: number;
}

export function WhisperDiagnosticTool() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const recordingCountRef = useRef(0);
  const chunkTimingsRef = useRef<number[]>([]);
  
  const whisper = useSimpleWhisperHybrid({
    autoPreload: false,
    preferWorker: false, // Use main thread for diagnostic
    retryCount: 3,
    retryDelay: 1000
  });

  // Test 1: Verificar estado inicial del preload
  const testPreloadState = async () => {
    const result: DiagnosticResult = {
      test: 'Preload State Check',
      status: 'pass',
      message: '',
      timestamp: Date.now()
    };

    try {
      const state = whisperPreloadManager.getState();
      const isLoaded = whisperModelCache.isModelLoaded();
      
      result.details = {
        preloadStatus: state.status,
        modelCached: isLoaded,
        hasShownToast: state.hasShownSuccessToast,
        globalCache: {
          worker: !!(window as any).__WHISPER_WORKER_INSTANCE__,
          model: !!(window as any).__WHISPER_MODEL_CACHE__,
          loaded: !!(window as any).__WHISPER_MODEL_LOADED__
        }
      };

      if (state.status === 'loaded' && isLoaded) {
        result.message = '✓ Modelo precargado correctamente, caché global activo';
      } else if (state.status === 'loading') {
        result.status = 'warn';
        result.message = '⚠️ Modelo aún cargando...';
      } else {
        result.status = 'fail';
        result.message = '✗ Modelo no cargado o caché perdido';
      }
    } catch (error) {
      result.status = 'fail';
      result.message = `Error: ${error.message}`;
    }

    return result;
  };

  // Test 2: Verificar no-recarga en múltiples inicios
  const testPreloadPersistence = async () => {
    const result: DiagnosticResult = {
      test: 'Preload Persistence',
      status: 'pass',
      message: '',
      timestamp: Date.now()
    };

    try {
      const initialState = whisperPreloadManager.getState();
      const wasLoaded = initialState.status === 'loaded';
      
      // Intentar forzar preload
      await whisperPreloadManager.forcePreload();
      
      const afterState = whisperPreloadManager.getState();
      
      if (wasLoaded && afterState.status === 'loaded') {
        result.message = '✓ Modelo no se recargó, caché persistente funcionando';
      } else if (!wasLoaded && afterState.status === 'loaded') {
        result.status = 'warn';
        result.message = '⚠️ Modelo tuvo que cargarse (primera vez)';
      } else {
        result.status = 'fail';
        result.message = '✗ Problema con persistencia del caché';
      }
      
      result.details = {
        before: initialState.status,
        after: afterState.status,
        cacheIntact: wasLoaded && afterState.status === 'loaded'
      };
    } catch (error) {
      result.status = 'fail';
      result.message = `Error: ${error.message}`;
    }

    return result;
  };

  // Test 3: Verificar denoising pipeline
  const testDenoisingPipeline = async () => {
    const result: DiagnosticResult = {
      test: 'Denoising Pipeline',
      status: 'pass',
      message: '',
      timestamp: Date.now()
    };

    try {
      // Crear audio de prueba
      const testAudio = new Float32Array(32000); // 2 segundos a 16kHz
      for (let i = 0; i < testAudio.length; i++) {
        testAudio[i] = Math.sin(2 * Math.PI * 440 * i / 16000) * 0.1; // 440Hz tone
      }
      
      const startTime = Date.now();
      const pipelineResult = await audioPipelineIntegration.processAudioWithDenoising(testAudio);
      const processingTime = Date.now() - startTime;
      
      result.details = {
        processingTime,
        usedDenoising: pipelineResult.usedDenoising,
        fallbackMode: pipelineResult.fallbackMode,
        qualityMetrics: pipelineResult.qualityMetrics,
        pipelineLog: pipelineResult.pipelineLog?.slice(-5)
      };
      
      if (pipelineResult.usedDenoising && processingTime < 1000) {
        result.message = `✓ Denoising activo, procesado en ${processingTime}ms`;
      } else if (pipelineResult.fallbackMode) {
        result.status = 'warn';
        result.message = `⚠️ Pipeline en modo fallback, tiempo: ${processingTime}ms`;
      } else if (processingTime > 1000) {
        result.status = 'warn';
        result.message = `⚠️ Denoising lento: ${processingTime}ms (límite: 1000ms)`;
      } else {
        result.status = 'fail';
        result.message = '✗ Denoising no funcionó correctamente';
      }
    } catch (error) {
      result.status = 'fail';
      result.message = `Error: ${error.message}`;
    }

    return result;
  };

  // Test 4: Grabación múltiple sin degradación
  const testMultipleRecordings = async () => {
    const result: DiagnosticResult = {
      test: 'Multiple Recording Cycles',
      status: 'pass',
      message: '',
      timestamp: Date.now()
    };

    try {
      const cycles = 3;
      const cycleResults = [];
      
      for (let i = 0; i < cycles; i++) {
        chunkTimingsRef.current = [];
        
        // Iniciar grabación
        const started = await whisper.startTranscription();
        if (!started) throw new Error(`Fallo al iniciar grabación ${i + 1}`);
        
        // Grabar por 2 segundos
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Detener grabación
        const stopped = await whisper.stopTranscription();
        if (!stopped) throw new Error(`Fallo al detener grabación ${i + 1}`);
        
        const modelStillLoaded = whisperModelCache.isModelLoaded();
        const engineStatus = whisper.engineStatus;
        
        cycleResults.push({
          cycle: i + 1,
          modelLoaded: modelStillLoaded,
          engineStatus,
          chunksProcessed: chunkTimingsRef.current.length,
          transcriptionLength: whisper.transcription?.text?.length || 0
        });
        
        // Reset para siguiente ciclo
        whisper.resetTranscription();
        recordingCountRef.current++;
        
        // Pequeña pausa entre ciclos
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      result.details = { cycles: cycleResults };
      
      const allCyclesOk = cycleResults.every(c => c.modelLoaded && c.engineStatus === 'ready');
      
      if (allCyclesOk) {
        result.message = `✓ ${cycles} ciclos completados sin degradación, modelo estable`;
      } else {
        result.status = 'fail';
        result.message = '✗ Degradación detectada en ciclos múltiples';
      }
    } catch (error) {
      result.status = 'fail';
      result.message = `Error: ${error.message}`;
    }

    return result;
  };

  // Test 5: Verificar logs y warnings
  const testLogsAndWarnings = async () => {
    const result: DiagnosticResult = {
      test: 'Console Logs Check',
      status: 'pass',
      message: '',
      timestamp: Date.now()
    };

    try {
      // Capturar logs durante una operación
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;
      
      const logs: string[] = [];
      const warns: string[] = [];
      const errors: string[] = [];
      
      console.log = (...args) => {
        logs.push(args.join(' '));
        originalLog(...args);
      };
      console.warn = (...args) => {
        warns.push(args.join(' '));
        originalWarn(...args);
      };
      console.error = (...args) => {
        errors.push(args.join(' '));
        originalError(...args);
      };
      
      // Ejecutar operación de prueba
      await whisper.preloadModel();
      
      // Restaurar console
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      
      const criticalErrors = errors.filter(e => 
        e.includes('worker not initialized') ||
        e.includes('model not loaded') ||
        e.includes('pipeline fallback')
      );
      
      result.details = {
        totalLogs: logs.length,
        totalWarns: warns.length,
        totalErrors: errors.length,
        criticalErrors: criticalErrors.length,
        sampleWarnings: warns.slice(0, 3),
        sampleErrors: errors.slice(0, 3)
      };
      
      if (criticalErrors.length === 0 && errors.length === 0) {
        result.message = '✓ Sin errores críticos en console';
      } else if (criticalErrors.length > 0) {
        result.status = 'fail';
        result.message = `✗ ${criticalErrors.length} errores críticos detectados`;
      } else {
        result.status = 'warn';
        result.message = `⚠️ ${errors.length} errores no críticos`;
      }
    } catch (error) {
      result.status = 'fail';
      result.message = `Error: ${error.message}`;
    }

    return result;
  };

  // Ejecutar todos los tests
  const runDiagnostics = async () => {
    setRunning(true);
    setResults([]);
    setTestProgress(0);
    
    const tests = [
      testPreloadState,
      testPreloadPersistence,
      testDenoisingPipeline,
      testMultipleRecordings,
      testLogsAndWarnings
    ];
    
    for (let i = 0; i < tests.length; i++) {
      const result = await tests[i]();
      setResults(prev => [...prev, result]);
      setTestProgress((i + 1) / tests.length * 100);
      
      // Pausa entre tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setRunning(false);
  };

  // Auto-run al montar
  useEffect(() => {
    const timer = setTimeout(() => {
      runDiagnostics();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: 'pass' | 'fail' | 'warn') => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-50';
      case 'fail': return 'text-red-600 bg-red-50';
      case 'warn': return 'text-yellow-600 bg-yellow-50';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🔬 Whisper Pipeline Diagnostic</span>
          <Button 
            onClick={runDiagnostics} 
            disabled={running}
            size="sm"
          >
            {running ? 'Running...' : 'Run Tests'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {running && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${testProgress}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {results.map((result, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{result.test}</h3>
                  <p className="text-sm mt-1">{result.message}</p>
                </div>
                <span className="text-2xl ml-2">
                  {result.status === 'pass' && '✅'}
                  {result.status === 'fail' && '❌'}
                  {result.status === 'warn' && '⚠️'}
                </span>
              </div>
              
              {result.details && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm opacity-70">
                    Ver detalles
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto bg-black/5 p-2 rounded">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
        
        {results.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h4 className="font-semibold mb-2">Resumen:</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl">
                  {results.filter(r => r.status === 'pass').length}
                </div>
                <div className="text-green-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">
                  {results.filter(r => r.status === 'warn').length}
                </div>
                <div className="text-yellow-600">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">
                  {results.filter(r => r.status === 'fail').length}
                </div>
                <div className="text-red-600">Failed</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}