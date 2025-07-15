# Fix: Sistema de Transcripción con Circuit Breaker

## Problema Identificado

El sistema de transcripción estaba fallando silenciosamente debido a un circuit breaker que se quedaba permanentemente abierto. Cuando ocurría el primer error de speech recognition, el circuit breaker se activaba y bloqueaba todos los intentos posteriores sin feedback visual para el usuario.

### Síntomas:
- La transcripción se bloqueaba después del primer error
- No había retroalimentación visual de errores
- El circuit breaker no se reseteaba automáticamente
- Los usuarios no podían continuar capturando conversaciones

## Solución Implementada

### 1. WebSpeechEngine con Reset Automático

Creado `WebSpeechEngine.js` con las siguientes características:

```javascript
// Forzar reset del circuit breaker al iniciar nueva transcripción
forceResetCircuitBreaker() {
  this.isCircuitBreakerOpen = false;
  this.consecutiveErrors = 0;
  this.retryCount = 0;
  this.lastErrorTime = null;
}
```

### 2. Manejo Inteligente de Errores

- **Errores Recuperables**: network, audio-capture, no-speech, aborted
  - Se ignoran y permiten auto-restart
  - No incrementan el contador de errores

- **Errores Críticos**: not-allowed, service-not-allowed, bad-grammar
  - Detienen completamente la transcripción
  - Activan el modo manual automáticamente

### 3. Hook useTranscription Mejorado

- Reset completo del engine antes de cada inicio
- Integración con modo manual de respaldo
- Callbacks para manejo de errores personalizado

### 4. Componente de Debug

`TranscriptionDebugPanel` muestra en tiempo real:
- Estado del circuit breaker
- Errores consecutivos y reintentos
- Transcripción actual
- Historial de errores

### 5. Modo Manual de Respaldo

- Textarea para entrada manual cuando falla el reconocimiento
- Cambio automático a modo manual en errores críticos
- Sincronización transparente entre modos

## Archivos Creados/Modificados

1. `/src/domains/medical-ai/engines/WebSpeechEngine.js` - Motor de transcripción con circuit breaker
2. `/src/domains/medical-ai/hooks/useTranscription.ts` - Hook React para transcripción
3. `/src/components/medical/TranscriptionDebugPanel.tsx` - Panel de debug
4. `/src/components/medical/ConversationCaptureEnhanced.tsx` - Componente mejorado con fallback manual
5. `/src/examples/transcription-with-circuit-breaker.tsx` - Ejemplo de uso

## Uso

### Componente Completo:

```tsx
import { ConversationCaptureEnhanced } from '@/components/medical/ConversationCaptureEnhanced';

<ConversationCaptureEnhanced
  onTranscriptionComplete={(transcript) => console.log(transcript)}
  showDebug={true} // En desarrollo
/>
```

### Hook Directo:

```tsx
import { useTranscription } from '@/domains/medical-ai/hooks/useTranscription';

const {
  isListening,
  transcript,
  error,
  startTranscription,
  stopTranscription,
  isManualMode,
  enableManualMode
} = useTranscription();
```

## Validación

Para verificar que el fix funciona correctamente:

1. **Test de Error Recuperable**:
   - Desconectar internet mientras graba
   - El sistema debe continuar intentando sin bloquear

2. **Test de Error Crítico**:
   - Denegar permisos de micrófono
   - Debe cambiar automáticamente a modo manual

3. **Test de Reset**:
   - Provocar múltiples errores
   - Al hacer clic en "Iniciar" debe resetear todo

4. **Panel de Debug**:
   - Verificar que el circuit breaker muestra "Cerrado" al iniciar
   - Los contadores deben resetearse correctamente

## Configuración

El sistema usa las siguientes configuraciones por defecto:

- `maxConsecutiveErrors`: 3 (errores antes de abrir circuit breaker)
- `circuitBreakerTimeout`: 30000ms (tiempo antes de auto-reset)
- `maxRetries`: 5 (reintentos máximos)

Estos valores pueden ajustarse en `WebSpeechEngine.js` según necesidades.

## Notas Adicionales

- El sistema ahora es resiliente a errores transitorios
- Los usuarios siempre tienen una alternativa (modo manual)
- El debug panel ayuda a diagnosticar problemas en producción
- La transcripción nunca queda bloqueada permanentemente