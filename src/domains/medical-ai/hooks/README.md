# useSimpleWhisper - Hook Unificado

## Descripción

El hook `useSimpleWhisper` es la versión unificada que integra todas las funcionalidades de los hooks anteriores:

- ✅ `useSimpleWhisper` (original) - Streaming procesamiento
- ✅ `useSimpleWhisperDirect` - Procesamiento directo en Worker
- ✅ `useSimpleWhisperEnhanced` - Integración con preload manager

## Características

### 🎯 **Modos de Procesamiento**
- **`direct`** (por defecto): Procesamiento directo en Worker para mejor rendimiento
- **`streaming`**: Procesamiento en streaming para transcripción en tiempo real
- **`enhanced`**: Modo mejorado con preload manager visible

### 🔧 **Configuración Unificada**

```typescript
const whisperHook = useSimpleWhisper({
  // Configuración principal
  autoPreload: false,
  processingMode: 'direct', // 'streaming' | 'direct' | 'enhanced'
  
  // Configuración de audio
  chunkSize: 16000,
  sampleRate: 16000,
  
  // Configuración de preload
  preloadPriority: 'auto', // 'high' | 'low' | 'auto'
  preloadDelay: 2000,
  
  // Manejo de errores
  retryCount: 3,
  retryDelay: 1000,
  
  // Debug
  logger: customLogger,
  showPreloadStatus: true
});
```

### 📊 **Interfaz de Retorno Unificada**

```typescript
interface UseSimpleWhisperReturn {
  // Transcripción principal
  transcription: Transcription | null;
  status: 'idle' | 'recording' | 'processing' | 'completed' | 'error';
  isRecording: boolean;
  error: string | null;
  
  // Estado del motor
  engineStatus: 'loading' | 'ready' | 'error';
  loadProgress: number;
  
  // Monitoreo de audio
  audioLevel: number;
  recordingTime: number;
  audioUrl: string | null;
  audioBlob: Blob | null;
  
  // Controles
  startTranscription: () => Promise<boolean>;
  stopTranscription: () => Promise<boolean>;
  resetTranscription: () => void;
  preloadModel: () => Promise<void>;
  
  // Estado de preload (de Enhanced)
  preloadStatus: 'idle' | 'loading' | 'loaded' | 'failed';
  preloadProgress: number;
  isPreloaded: boolean;
  
  // Debug
  setLogger?: (enabled: boolean) => void;
}
```

### 🏥 **Integración con Workflow Médico**

```typescript
// Uso en componente médico
const {
  transcription,
  status,
  isRecording,
  engineStatus,
  preloadStatus,
  startTranscription,
  stopTranscription,
  resetTranscription
} = useSimpleWhisper({
  processingMode: 'direct',
  showPreloadStatus: true,
  autoPreload: false
});

// Manejo de transcripción médica
useEffect(() => {
  if (transcription) {
    // Procesar términos médicos
    const medicalTerms = transcription.medicalTerms;
    // Continuar con workflow médico
  }
}, [transcription]);
```

## Migración

### Desde `useSimpleWhisper` (original)
```typescript
// Antes
const hook = useSimpleWhisper({ 
  autoPreload: true,
  retryCount: 3 
});

// Después - Sin cambios necesarios
const hook = useSimpleWhisper({ 
  autoPreload: true,
  retryCount: 3,
  processingMode: 'streaming' // Para mantener comportamiento streaming
});
```

### Desde `useSimpleWhisperDirect`
```typescript
// Antes
const hook = useSimpleWhisperDirect({ 
  autoPreload: false,
  logger: myLogger
});

// Después
const hook = useSimpleWhisper({ 
  autoPreload: false,
  logger: myLogger,
  processingMode: 'direct' // Ya es el default
});
```

### Desde `useSimpleWhisperEnhanced`
```typescript
// Antes
const hook = useSimpleWhisperEnhanced({ 
  /* opciones */ 
});

// Después
const hook = useSimpleWhisper({ 
  processingMode: 'enhanced',
  showPreloadStatus: true
});
```

## Ejemplos de Uso

### Transcripción Médica Básica
```typescript
function MedicalTranscriptionComponent() {
  const {
    transcription,
    status,
    isRecording,
    engineStatus,
    startTranscription,
    stopTranscription,
    resetTranscription
  } = useSimpleWhisper({
    processingMode: 'direct',
    autoPreload: false
  });

  const handleStartRecording = async () => {
    if (engineStatus === 'ready') {
      await startTranscription();
    }
  };

  return (
    <div>
      <button onClick={handleStartRecording} disabled={engineStatus !== 'ready'}>
        {isRecording ? 'Detener' : 'Iniciar'} Grabación
      </button>
      
      {transcription && (
        <div>
          <p>Transcripción: {transcription.text}</p>
          <p>Términos médicos: {transcription.medicalTerms.join(', ')}</p>
          <p>Confianza: {transcription.confidence}</p>
        </div>
      )}
    </div>
  );
}
```

### Con Preload Visible
```typescript
function MedicalTranscriptionWithPreload() {
  const {
    transcription,
    engineStatus,
    preloadStatus,
    preloadProgress,
    isPreloaded,
    startTranscription,
    stopTranscription
  } = useSimpleWhisper({
    processingMode: 'direct',
    showPreloadStatus: true,
    autoPreload: true
  });

  if (preloadStatus === 'loading') {
    return <div>Cargando modelo médico... {preloadProgress}%</div>;
  }

  return (
    <div>
      <div>Estado: {engineStatus}</div>
      <div>Preload: {isPreloaded ? 'Listo' : 'No cargado'}</div>
      {/* ... resto del componente */}
    </div>
  );
}
```

## Ventajas del Hook Unificado

1. **✅ Interfaz única**: Un solo hook para todas las funcionalidades
2. **✅ Configuración flexible**: Modos de procesamiento intercambiables
3. **✅ Mejor rendimiento**: Optimizado para workflow médico
4. **✅ Preload inteligente**: Integración con sistema de cache global
5. **✅ Debug mejorado**: Logging detallado por modo de procesamiento
6. **✅ Compatibilidad**: Mantiene compatibilidad con componentes existentes

## Notas de Rendimiento

- **Modo `direct`**: Mejor para transcripción médica precisa
- **Modo `streaming`**: Mejor para transcripción en tiempo real
- **Preload automático**: Recomendado para workflows médicos frecuentes
- **Cache global**: Modelo se carga una sola vez por sesión