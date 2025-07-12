# 🎙️ PROMPT COMPLETO: Migración Transcripción Frontend → Backend API

## 🎯 **OBJETIVO PRINCIPAL**
Crear endpoint `/api/transcription` en Next.js que actúe como proxy entre frontend y microservicio SusurroTest, eliminando acceso directo desde cliente.

## 🚫 **PROBLEMA ACTUAL**
- Frontend llama directamente a `http://localhost:3001` (SusurroTest)
- Exposición de URL de microservicio en cliente
- Falta capa de abstracción y validación
- Sin manejo centralizado de FFmpeg/conversión

## ✅ **SOLUCIÓN REQUERIDA**
Crear endpoint Next.js que:
1. Reciba audio blob desde frontend
2. Procese/valide archivo
3. Transforme a formato correcto (WAV/FFmpeg si necesario)
4. Envíe al microservicio SusurroTest
5. Retorne respuesta unificada

---

## 📂 **ARCHIVOS A CREAR/MODIFICAR**

### 1. **app/api/transcription/route.ts** ⭐ (NUEVO - PRINCIPAL)
```typescript
/**
 * 🎙️ Endpoint de Transcripción - Proxy a SusurroTest
 * Maneja audio desde frontend, procesa y envía a microservicio
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Configuración del microservicio
const SUSURRO_CONFIG = {
  baseUrl: process.env.SUSURRO_SERVICE_URL || 'http://localhost:3001',
  endpoint: '/api/transcribe-upload',
  timeout: 30000, // 30 segundos
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['audio/wav', 'audio/webm', 'audio/mp3', 'audio/m4a']
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 📝 Logs con emojis (mantener estilo existente)
    console.log('🎙️ [Transcription API] Iniciando procesamiento...');
    
    // 📋 Validar Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: '🚫 Content-Type debe ser multipart/form-data' },
        { status: 400 }
      );
    }

    // 📁 Extraer archivo del FormData
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      console.log('❌ [Transcription API] No se encontró archivo de audio');
      return NextResponse.json(
        { success: false, error: '🎤 No se encontró archivo de audio' },
        { status: 400 }
      );
    }

    // 🔍 Validaciones de archivo
    if (audioFile.size > SUSURRO_CONFIG.maxFileSize) {
      return NextResponse.json(
        { success: false, error: `📏 Archivo muy grande. Máximo: ${SUSURRO_CONFIG.maxFileSize / 1024 / 1024}MB` },
        { status: 413 }
      );
    }

    console.log(`🎵 [Transcription API] Archivo recibido: ${audioFile.name} (${audioFile.size} bytes)`);

    // 🔄 Convertir a formato compatible si es necesario
    let processedFile = audioFile;
    if (!SUSURRO_CONFIG.allowedTypes.includes(audioFile.type)) {
      console.log(`🔄 [Transcription API] Convirtiendo ${audioFile.type} a WAV...`);
      processedFile = await convertToWAV(audioFile);
    }

    // 🌐 Preparar FormData para microservicio
    const susurroFormData = new FormData();
    susurroFormData.append('audio', processedFile);

    // 📡 Enviar a SusurroTest
    console.log('📡 [Transcription API] Enviando a SusurroTest...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SUSURRO_CONFIG.timeout);

    const response = await fetch(`${SUSURRO_CONFIG.baseUrl}${SUSURRO_CONFIG.endpoint}`, {
      method: 'POST',
      body: susurroFormData,
      signal: controller.signal,
      headers: {
        // No incluir Content-Type, fetch lo manejará automáticamente con FormData
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`SusurroTest error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const processingTime = Date.now() - startTime;

    console.log(`✅ [Transcription API] Completado en ${processingTime}ms`);
    console.log(`📝 [Transcription API] Transcripción: "${result.transcript}"`);

    // 📤 Respuesta unificada
    return NextResponse.json({
      success: true,
      transcript: result.transcript || '',
      confidence: result.confidence || 0,
      processing_time_ms: processingTime,
      source: 'susurro-microservice',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [Transcription API] Error después de ${processingTime}ms:`, error);

    // 🔍 Manejo específico de errores
    let errorMessage = 'Error interno del servidor';
    let statusCode = 500;

    if (error.name === 'AbortError') {
      errorMessage = '⏱️ Timeout: El procesamiento tardó demasiado';
      statusCode = 408;
    } else if (error.message.includes('SusurroTest')) {
      errorMessage = '🔴 Microservicio SusurroTest no disponible';
      statusCode = 503;
    } else if (error.message.includes('fetch')) {
      errorMessage = '🌐 Error de conectividad con SusurroTest';
      statusCode = 502;
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        processing_time_ms: processingTime,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}

// 🔄 Función para convertir audio a WAV (si es necesario)
async function convertToWAV(audioFile: File): Promise<File> {
  // Implementar conversión usando FFmpeg o Web Audio API
  // Por ahora, retornar el archivo original
  console.log('⚠️ [Transcription API] Conversión WAV no implementada, usando archivo original');
  return audioFile;
}

export async function GET() {
  return NextResponse.json({
    message: '🎙️ Transcription API - Endpoint para procesamiento de audio',
    methods: ['POST'],
    maxFileSize: `${SUSURRO_CONFIG.maxFileSize / 1024 / 1024}MB`,
    allowedTypes: SUSURRO_CONFIG.allowedTypes,
    microservice: SUSURRO_CONFIG.baseUrl
  });
}
```

### 2. **hooks/useTranscription.ts** 🔄 (MODIFICAR)
```typescript
// 🔄 Cambiar SusurroClient para apuntar al endpoint local
class SusurroClient {
  static async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    
    // ✅ CAMBIO PRINCIPAL: Apuntar al endpoint local en lugar del microservicio
    const response = await fetch('/api/transcription', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  static async healthCheck(): Promise<{ status: string }> {
    // Mantener health check al microservicio directo para validación
    const response = await fetch('/api/transcription');
    return await response.json();
  }
}
```

### 3. **lib/ffmpeg.ts** 🆕 (OPCIONAL - FUTURO)
```typescript
/**
 * 🎵 FFmpeg utilities para conversión de audio
 * Para implementación futura de conversión en servidor
 */

// Placeholder para futuras implementaciones de FFmpeg
export async function convertAudioToWAV(inputBuffer: ArrayBuffer): Promise<ArrayBuffer> {
  // Implementar usando @ffmpeg/ffmpeg o similar
  throw new Error('FFmpeg conversion not implemented yet');
}
```

### 4. **middleware.ts** 🔄 (MODIFICAR SI EXISTE)
```typescript
// Añadir validaciones específicas para /api/transcription
export function middleware(request: NextRequest) {
  // Validaciones de rate limiting para transcripción si es necesario
  if (request.nextUrl.pathname.startsWith('/api/transcription')) {
    // Implementar rate limiting, authentication, etc.
  }
}
```

---

## 🔧 **VARIABLES DE ENTORNO**

### **.env.local** 🔄 (MODIFICAR)
```bash
# Microservicio SusurroTest (solo para backend)
SUSURRO_SERVICE_URL=http://localhost:3001

# Configuración de transcripción
TRANSCRIPTION_MAX_FILE_SIZE=10485760  # 10MB
TRANSCRIPTION_TIMEOUT=30000           # 30 segundos
```

### **.env.example** 🔄 (ACTUALIZAR)
```bash
# Añadir documentación de nuevas variables
SUSURRO_SERVICE_URL=http://localhost:3001
TRANSCRIPTION_MAX_FILE_SIZE=10485760
TRANSCRIPTION_TIMEOUT=30000
```

---

## 🧪 **TESTING**

### **Pruebas a realizar:**
1. **Endpoint básico**: `curl -X GET http://localhost:3000/api/transcription`
2. **Upload de audio**: Test con archivo WAV/WebM pequeño
3. **Validación de tamaño**: Test con archivo grande (>10MB)
4. **Timeout**: Test con microservicio desconectado
5. **Tipos de archivo**: Test con MP3, M4A, etc.

### **Comando de prueba manual:**
```bash
# Test básico del endpoint
curl -X POST http://localhost:3000/api/transcription \
  -F "audio=@test-audio.wav" \
  -H "Accept: application/json"
```

---

## 📋 **VALIDATION CHECKLIST**

- [ ] ✅ **Endpoint creado**: `/api/transcription/route.ts` existe
- [ ] 🔄 **Hook actualizado**: useTranscription apunta a endpoint local
- [ ] 🚫 **Sin acceso directo**: Frontend no llama a `localhost:3001`
- [ ] 📝 **Logging consistente**: Emojis y formato mantenido
- [ ] 🔍 **Validaciones**: Tamaño, tipo, timeout implementados
- [ ] 🌐 **Error handling**: Manejo de fallos del microservicio
- [ ] ⚡ **Performance**: Respuesta en <5 segundos típico
- [ ] 🧪 **Testing**: Pruebas básicas completadas

---

## 🚀 **EJECUCIÓN**

### **Orden de implementación:**
1. **Crear** `app/api/transcription/route.ts`
2. **Modificar** `hooks/useTranscription.ts` (SusurroClient)
3. **Actualizar** variables de entorno
4. **Probar** endpoint con archivo de audio
5. **Validar** que frontend funciona sin acceso directo
6. **Documentar** cambios en README

### **Comandos para probar:**
```bash
# 1. Iniciar microservicio
cd microservices/susurro-test && npm start

# 2. Iniciar Next.js
npm run dev

# 3. Probar endpoint
curl -X GET http://localhost:3000/api/transcription

# 4. Probar transcripción
# (usar interfaz web o curl con archivo)
```

---

## 📖 **DOCUMENTACIÓN ADICIONAL**

### **README.md actualización:**
```markdown
## 🎙️ Transcripción de Audio

La transcripción utiliza un endpoint proxy `/api/transcription` que:
- Valida archivos de audio del frontend
- Procesa y envía al microservicio SusurroTest
- Retorna respuesta unificada
- Maneja errores y timeouts

### Uso desde frontend:
\`\`\`typescript
const formData = new FormData();
formData.append('audio', audioBlob);

const response = await fetch('/api/transcription', {
  method: 'POST',
  body: formData
});
\`\`\`
```

---

## 🎯 **RESULTADO ESPERADO**

**Antes:** `Frontend → http://localhost:3001 (directo)`
**Después:** `Frontend → /api/transcription → SusurroTest`

✅ **Seguridad mejorada**: No exposición de URLs internas
✅ **Validación centralizada**: Control en servidor
✅ **Error handling robusto**: Manejo de fallos del microservicio
✅ **Logging unificado**: Consistente con estilo existente
✅ **Escalabilidad**: Fácil cambio de microservicio backend

---

*🩺 **NOTA MÉDICA**: Esta migración mejora la seguridad y confiabilidad del sistema de transcripción médica, critical para entornos clínicos donde la disponibilidad es vital.*