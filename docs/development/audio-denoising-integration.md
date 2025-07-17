# Audio Denoising Integration - "BAZAAR MODE"

## 🎯 Objetivo

**Eliminar ruido clínico del audio PRE-Whisper** siguiendo la filosofía "Bazaar":
- Proceso completamente **auditable**
- Cada algoritmo **público y modificable**
- Sin cajas negras
- Forking y mejoras sin fricción

## 🏗️ Arquitectura Modular

### Core Components

```
Audio Raw → [ClinicalAudioEnhancer] → [AudioPipelineIntegration] → Whisper → Transcripción
```

1. **ClinicalAudioEnhancer** - Servicio principal de denoising
2. **AudioPipelineIntegration** - Integración con pipeline existente
3. **AudioDenoisingDashboard** - Dashboard de métricas en tiempo real
4. **Enhanced Worker** - Worker con denoising integrado

## 📋 Características Implementadas

### ✅ Completadas

- [x] **Servicio modular ClinicalAudioEnhancer** con endpoints públicos
- [x] **Catálogo configurable de ruidos** (monitores, alarmas, ventiladores, etc.)
- [x] **Modelo de clasificación auditable** con algoritmos públicos
- [x] **Filtros ajustables por tipo** con enable/disable
- [x] **Modo "preservar alarmas críticas"** con alertas inmediatas
- [x] **Perfiles de ambiente** (consultorio, urgencias, UCI) con import/export
- [x] **Ajuste dinámico en tiempo real** con logging completo
- [x] **Dashboard de métricas accesibles** con visualización transparente
- [x] **API endpoints completamente públicos**

## 🔧 Configuración

### Tipos de Ruido Clínico

```javascript
noiseTypes: {
  monitors: { enabled: true, threshold: 0.7, filterStrength: 0.8 },
  alarms: { enabled: true, threshold: 0.6, filterStrength: 0.4 }, // MÁS SUAVE
  ventilators: { enabled: true, threshold: 0.8, filterStrength: 0.9 },
  airconditioner: { enabled: true, threshold: 0.5, filterStrength: 0.7 },
  footsteps: { enabled: true, threshold: 0.4, filterStrength: 0.6 },
  paperwork: { enabled: true, threshold: 0.3, filterStrength: 0.5 },
  keyboard: { enabled: true, threshold: 0.2, filterStrength: 0.4 },
  phoneRings: { enabled: true, threshold: 0.7, filterStrength: 0.8 },
  doorSlams: { enabled: true, threshold: 0.8, filterStrength: 0.9 },
  conversations: { enabled: false, threshold: 0.1, filterStrength: 0.1 } // DESHABILITADO
}
```

### Perfiles de Ambiente

```javascript
environments: {
  consultorio: {
    name: 'Consultorio General',
    enabledNoises: ['monitors', 'airconditioner', 'footsteps', 'paperwork'],
    globalThreshold: 0.5,
    preserveAlarms: true,
    aggressiveness: 0.6
  },
  urgencias: {
    name: 'Urgencias',
    enabledNoises: ['monitors', 'alarms', 'ventilators', 'footsteps'],
    globalThreshold: 0.4,
    preserveAlarms: true,
    aggressiveness: 0.7
  },
  uci: {
    name: 'UCI',
    enabledNoises: ['monitors', 'alarms', 'ventilators'],
    globalThreshold: 0.3,
    preserveAlarms: true,
    aggressiveness: 0.5 // MÁS SUAVE en UCI
  }
}
```

## 🚀 API Endpoints

### Endpoints Públicos

```bash
# Estado del sistema
GET /api/audio/denoising/status

# Métricas de rendimiento
GET /api/audio/denoising/metrics

# Configuración actual
GET /api/audio/denoising/config

# Actualizar configuración
POST /api/audio/denoising/config

# Procesar audio
POST /api/audio/denoising/process

# Ejecutar benchmark
POST /api/audio/denoising/benchmark

# Log de auditoría
GET /api/audio/denoising/audit

# Exportar/Importar configuración
GET /api/audio/denoising/export
POST /api/audio/denoising/import
```

### Ejemplo de Uso

```javascript
// Procesar audio con denoising
const response = await fetch('/api/audio/denoising/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    audioData: audioArray,
    options: {
      environment: 'urgencias',
      enableQualityMetrics: true
    }
  })
});

const result = await response.json();
// result.data.enhancedAudio - audio procesado
// result.data.activeFilters - filtros aplicados
// result.data.noiseClassifications - ruidos detectados
```

## 📊 Dashboard de Métricas

### Métricas Visibles

- **Estado del sistema** - Inicialización, modelo, ambiente actual
- **Rendimiento** - Tiempo de procesamiento, tasa de éxito, errores
- **Calidad** - Reducción de ruido, preservación de alarmas
- **Configuración** - Tipos de ruido, filtros activos
- **Auditoría** - Log completo de acciones

### Acceso al Dashboard

```bash
# Componente React
import AudioDenoisingDashboard from '@/src/components/medical/AudioDenoisingDashboard';

# Uso
<AudioDenoisingDashboard />
```

## 🔍 Algoritmos Públicos

### Clasificación de Ruidos

```javascript
// Algoritmo de clasificación basado en frecuencias
const signatures = {
  monitors: { freq: [800, 1200, 2000], pattern: 'beep' },
  alarms: { freq: [1000, 1500, 2500], pattern: 'continuous' },
  ventilators: { freq: [200, 400, 600], pattern: 'rhythmic' }
};

// Función de clasificación pública
classify(audioFeatures) {
  const classifications = {};
  Object.entries(signatures).forEach(([type, signature]) => {
    classifications[type] = calculateNoiseConfidence(audioFeatures, signature);
  });
  return classifications;
}
```

### Filtros de Denoising

```javascript
// Sustracción espectral básica
applySpectralSubtraction(audioData, filter) {
  const enhanced = new Float32Array(audioData.length);
  const alpha = 1 - filter.strength;
  
  for (let i = 1; i < audioData.length - 1; i++) {
    enhanced[i] = alpha * audioData[i] + (1 - alpha) * (audioData[i-1] + audioData[i+1]) / 2;
  }
  
  return enhanced;
}
```

## 🚨 Preservación de Alarmas

### Sistema de Alertas

```javascript
// Verificación automática de preservación
async verifyAlarmPreservation(originalAudio, enhancedAudio) {
  const preservationRate = enhancedAlarmLevel / originalAlarmLevel;
  
  if (preservationRate < 0.7) {
    // ALARMA CRÍTICA - raise issue inmediato
    await this.raiseAlarmPreservationIssue({
      originalLevel: originalAlarmLevel,
      enhancedLevel: enhancedAlarmLevel,
      preservationRate: preservationRate
    });
  }
}
```

## 🔧 Integración con Pipeline Existente

### Worker Mejorado

```javascript
// Enhanced Worker con denoising
import { audioPipelineIntegration } from '../services/AudioPipelineIntegration';

// Proceso integrado
async function processAudioChunk(data) {
  // 1. Aplicar denoising PRE-Whisper
  const pipelineResult = await audioPipelineIntegration.processAudioWithDenoising(
    audioData, { environment: 'consultorio' }
  );
  
  // 2. Procesar con Whisper
  const transcriptionResult = await pipeline(pipelineResult.processedAudio);
  
  // 3. Retornar resultado con métricas
  return {
    text: transcriptionResult.text,
    denoisingUsed: pipelineResult.usedDenoising,
    qualityMetrics: pipelineResult.qualityMetrics
  };
}
```

## 📈 Métricas de Calidad

### Cálculo de Métricas

```javascript
// Métricas calculadas automáticamente
const qualityMetrics = {
  noiseReduction: ((originalNoise - enhancedNoise) / originalNoise) * 100,
  signalPreservation: (enhancedSignal / originalSignal) * 100,
  processingArtifacts: detectProcessingArtifacts(original, enhanced),
  overallQuality: (noiseReduction * 0.4) + (signalPreservation * 0.4) + ((100 - artifacts) * 0.2)
};
```

## 🛠️ Configuración y Personalización

### Configuración por Ambiente

```javascript
// Cambiar ambiente
await clinicalAudioEnhancer.applyEnvironmentProfile('uci');

// Configurar filtros personalizados
await clinicalAudioEnhancer.configure({
  noiseTypes: {
    monitors: { enabled: true, threshold: 0.8, filterStrength: 0.9 }
  }
});
```

### Export/Import de Configuración

```javascript
// Exportar configuración
const config = clinicalAudioEnhancer.exportConfiguration();
downloadConfig(config);

// Importar configuración
clinicalAudioEnhancer.importConfiguration(uploadedConfig);
```

## 🔍 Auditoría y Logging

### Log de Auditoría

```javascript
// Cada acción es loggeada
logAudit(action, message) {
  const logEntry = {
    timestamp: new Date(),
    action: action,
    message: message,
    systemState: this.systemState.currentEnvironment,
    configVersion: this.systemState.configVersion
  };
  
  this.auditLog.push(logEntry);
}
```

### Acceso al Log

```javascript
// Obtener log completo
const auditLog = await fetch('/api/audio/denoising/audit');
const logData = await auditLog.json();
```

## 🧪 Benchmarking

### Ejecución de Benchmark

```javascript
// Benchmark público
const testSamples = [
  { id: 'sample1', audioData: audioArray1, options: { environment: 'uci' } },
  { id: 'sample2', audioData: audioArray2, options: { environment: 'urgencias' } }
];

const benchmarkResult = await fetch('/api/audio/denoising/benchmark', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ testSamples })
});
```

## 🚀 Próximos Pasos

### Mejoras Planificadas

1. **Modelos de denoising avanzados** - Integrar `facebook/denoiser` cuando esté disponible
2. **FFT real** - Mejorar análisis de frecuencias
3. **Machine Learning** - Clasificación automática de ruidos
4. **Streaming** - Procesamiento en tiempo real
5. **A/B Testing** - Comparación de modelos

### Contribuciones

- **Fork** el proyecto
- **Mejora** cualquier algoritmo
- **Documenta** tus cambios
- **Comparte** tus resultados

## 📚 Referencias

- [Xenova/speech-enhancement](https://huggingface.co/Xenova/speech-enhancement)
- [Facebook Denoiser](https://github.com/facebookresearch/denoiser)
- [Microsoft SpeechT5](https://huggingface.co/microsoft/speecht5_tts)
- [Spectral Subtraction](https://en.wikipedia.org/wiki/Spectral_subtraction)

## 🤝 Filosofía Bazaar

### Principios Aplicados

1. **Transparencia Total** - Cada algoritmo es público
2. **Modularidad** - Cada componente es independiente
3. **Auditabilidad** - Cada cambio es rastreable
4. **Colaboración** - Mejoras son bienvenidas
5. **Sin Vendor Lock-in** - Configuración portable

### Tu Denoising es Bazaar si:

- ✅ Puedes fork y mejorar cualquier parte
- ✅ Todos los algoritmos son públicos
- ✅ La configuración es exportable
- ✅ Los logs son accesibles
- ✅ Las métricas son transparentes

---

**¿Tu denoising es catedral o bazaar? Si no puedes auditarlo, no es bazaar.**