import { NextRequest, NextResponse } from 'next/server';

// Configuración requerida para Netlify
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Detectar entorno y capacidades
const isDevelopment = process.env.NODE_ENV === 'development';
const isTurbopack = process.env.TURBOPACK === '1' || process.env.NODE_ENV === 'development';

console.log('🔍 Entorno detectado:', {
  isDevelopment,
  isTurbopack,
  nodeEnv: process.env.NODE_ENV
});

// Singleton para el pipeline de Whisper
let whisperPipeline = null;
let whisperError = null;

async function initializeWhisper() {
  if (whisperPipeline) return whisperPipeline;
  if (whisperError) throw whisperError;

  try {
    console.log('🔥 Intentando cargar Whisper...');
    
    // Importación dinámica para evitar problemas de Turbopack
    const { pipeline } = await import('@xenova/transformers');
    
    whisperPipeline = await pipeline(
      'automatic-speech-recognition',
      'Xenova/whisper-small',
      {
        revision: 'main',
        quantized: true,
        // Configuración específica para desarrollo
        ...(isDevelopment && {
          cache_dir: './node_modules/.cache/huggingface',
          local_files_only: false
        })
      }
    );
    
    console.log('✅ Whisper cargado exitosamente');
    return whisperPipeline;
    
  } catch (error) {
    console.error('❌ Error cargando Whisper:', error);
    whisperError = error;
    throw error;
  }
}

// Función mock para desarrollo cuando Whisper falla
function createMockTranscription(audioSize, duration) {
  const mockTexts = [
    "Esta es una transcripción de prueba generada en modo desarrollo.",
    "El audio fue procesado correctamente pero Whisper no está disponible en Turbopack.",
    "Texto de ejemplo para demostrar el flujo de transcripción médica.",
    "Paciente presenta síntomas de dolor abdominal desde hace tres días.",
    "Se recomienda realizar análisis de sangre y radiografía de tórax."
  ];
  
  // Seleccionar texto basado en el tamaño del audio
  const index = Math.floor((audioSize / 10000) % mockTexts.length);
  return mockTexts[index];
}

export async function POST(request) {
  const startTime = Date.now();
  console.log('🚀 POST /api/transcribe iniciado');
  
  try {
    // 1. Obtener FormData
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    
    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'No se recibió archivo de audio' },
        { status: 400 }
      );
    }

    console.log('📁 Archivo recibido:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size
    });

    if (audioFile.size === 0) {
      return NextResponse.json(
        { success: false, error: 'Archivo de audio vacío' },
        { status: 400 }
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const audioData = new Uint8Array(arrayBuffer);
    const duration = audioFile.size / 16000; // Estimación aproximada
    
    let transcriptionResult = '';
    let processingMethod = '';
    let modelUsed = '';
    
    // Estrategia de transcripción basada en entorno
    if (isTurbopack || isDevelopment) {
      console.log('🔄 Modo desarrollo detectado, intentando Whisper con fallback...');
      
      try {
        // Intentar Whisper real primero
        const whisper = await initializeWhisper();
        const result = await whisper(arrayBuffer, {
          language: 'spanish',
          task: 'transcribe'
        });
        
        transcriptionResult = result?.text || '';
        processingMethod = 'whisper-real';
        modelUsed = 'Xenova/whisper-small';
        
        if (!transcriptionResult) {
          throw new Error('Whisper devolvió texto vacío');
        }
        
        console.log('✅ Whisper real funcionó en desarrollo');
        
      } catch (whisperErr) {
        console.warn('⚠️ Whisper falló en desarrollo, usando mock:', whisperErr.message);
        
        // Fallback: Mock inteligente
        transcriptionResult = createMockTranscription(audioFile.size, duration);
        processingMethod = 'mock-development';
        modelUsed = 'mock-whisper-dev';
      }
      
    } else {
      console.log('🚀 Modo producción, usando Whisper real...');
      
      // Producción: Whisper real
      const whisper = await initializeWhisper();
      const result = await whisper(arrayBuffer, {
        language: 'spanish',
        task: 'transcribe',
        return_timestamps: false
      });
      
      transcriptionResult = result?.text || '';
      processingMethod = 'whisper-production';
      modelUsed = 'Xenova/whisper-small';
      
      if (!transcriptionResult) {
        throw new Error('Whisper no pudo procesar el audio');
      }
    }
    
    const processingTime = Date.now() - startTime;
    
    console.log('📊 Transcripción completada:', {
      method: processingMethod,
      textLength: transcriptionResult.length,
      processingTime
    });
    
    const responseData = {
      success: true,
      data: {
        text: transcriptionResult,
        confidence: processingMethod === 'mock-development' ? 0.5 : 0.9,
        language: 'es',
        processingTime,
        metadata: {
          audioSize: audioFile.size,
          audioType: audioFile.type,
          modelUsed,
          processingMethod,
          environment: isDevelopment ? 'development' : 'production',
          turbopack: isTurbopack,
          estimatedDuration: Math.round(duration * 100) / 100
        }
      }
    };
    
    return NextResponse.json(responseData);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Error completo en transcripción:', {
      message: error.message,
      stack: error.stack,
      processingTime
    });
    
    // Fallback final: Mock de emergencia
    if (isDevelopment) {
      console.log('🆘 Fallback de emergencia activado');
      
      return NextResponse.json({
        success: true,
        data: {
          text: "Transcripción de emergencia: Audio procesado en modo desarrollo. Whisper no disponible en Turbopack.",
          confidence: 0.3,
          language: 'es',
          processingTime,
          metadata: {
            processingMethod: 'emergency-fallback',
            modelUsed: 'fallback-mock',
            environment: 'development-error',
            originalError: error.message
          }
        }
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        processingTime,
        debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Health check que informa sobre capacidades del entorno
export async function GET() {
  try {
    let whisperStatus = 'unknown';
    let capabilities = {};
    
    try {
      await initializeWhisper();
      whisperStatus = 'available';
    } catch (error) {
      whisperStatus = 'unavailable';
      capabilities.error = error.message;
    }
    
    return NextResponse.json({
      status: 'ok',
      environment: {
        isDevelopment,
        isTurbopack,
        nodeEnv: process.env.NODE_ENV
      },
      whisper: {
        status: whisperStatus,
        fallbackEnabled: isDevelopment,
        ...capabilities
      },
      endpoint: '/api/transcribe',
      methods: ['POST', 'GET'],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error.message },
      { status: 500 }
    );
  }
}