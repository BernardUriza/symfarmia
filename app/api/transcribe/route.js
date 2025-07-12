import { pipeline } from '@xenova/transformers';
import { NextRequest, NextResponse } from 'next/server';

// Singleton para evitar cargar el modelo en cada request
let whisperPipeline = null;

async function initializeWhisper() {
  if (!whisperPipeline) {
    console.log('🔥 Cargando Whisper model...');
    try {
      whisperPipeline = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-small',
        {
          revision: 'main',
          quantized: true
        }
      );
      console.log('✅ Whisper model cargado exitosamente');
      console.log('📊 Model info:', {
        model: whisperPipeline.model?.config?.model_type || 'unknown',
        tokenizer: whisperPipeline.tokenizer?.constructor?.name || 'unknown'
      });
    } catch (error) {
      console.error('❌ Error cargando modelo Whisper:', error);
      throw error;
    }
  }
  return whisperPipeline;
}

// Función para convertir audio a formato compatible
async function processAudioBuffer(arrayBuffer) {
  console.log('🔊 Procesando audio buffer...');
  console.log('📏 Buffer size:', arrayBuffer.byteLength, 'bytes');
  
  // Verificar si el buffer tiene contenido
  if (arrayBuffer.byteLength === 0) {
    throw new Error('Audio buffer está vacío');
  }
  
  if (arrayBuffer.byteLength < 1000) {
    console.warn('⚠️ Audio muy corto, puede no transcribirse correctamente');
  }
  
  // Para debugging, log primeros bytes del audio
  const firstBytes = new Uint8Array(arrayBuffer.slice(0, 16));
  console.log('🔍 Primeros 16 bytes del audio:', Array.from(firstBytes).map(b => b.toString(16).padStart(2, '0')).join(' '));
  
  return arrayBuffer;
}

export async function POST(request) {
  const startTime = Date.now();
  console.log('🚀 Iniciando petición POST /api/transcribe');
  
  try {
    // 1. Obtener FormData
    console.log('📥 Extrayendo FormData...');
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    
    console.log('📋 FormData keys:', Array.from(formData.keys()));
    
    if (!audioFile) {
      console.error('❌ No se encontró archivo de audio en FormData');
      return NextResponse.json(
        { success: false, error: 'No se recibió archivo de audio' },
        { status: 400 }
      );
    }

    // 2. Información del archivo
    console.log('📁 Información del archivo:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size
    });

    if (audioFile.size === 0) {
      console.error('❌ Archivo de audio vacío');
      return NextResponse.json(
        { success: false, error: 'Archivo de audio vacío' },
        { status: 400 }
      );
    }

    // 3. Convertir a ArrayBuffer
    console.log('🔄 Convirtiendo a ArrayBuffer...');
    const arrayBuffer = await audioFile.arrayBuffer();
    
    // 4. Procesar audio
    const processedAudio = await processAudioBuffer(arrayBuffer);
    
    // 5. Inicializar Whisper
    console.log('🤖 Inicializando Whisper...');
    const whisper = await initializeWhisper();
    
    // 6. Configuración de transcripción
    const transcriptionConfig = {
      language: 'spanish',
      task: 'transcribe',
      return_timestamps: false,
      chunk_length_s: 30,
      stride_length_s: 5
    };
    
    console.log('⚙️ Configuración transcripción:', transcriptionConfig);
    
    // 7. Transcribir con logs detallados
    console.log('🎙️ Iniciando transcripción con Whisper...');
    console.log('📊 Input data type:', processedAudio.constructor.name);
    console.log('📊 Input data size:', processedAudio.byteLength);
    
    const result = await whisper(processedAudio, transcriptionConfig);
    
    // 8. Analizar resultado
    console.log('📤 Resultado crudo de Whisper:', result);
    console.log('🔍 Tipo de resultado:', typeof result);
    console.log('🔍 Propiedades del resultado:', Object.keys(result || {}));
    
    if (result && typeof result === 'object') {
      console.log('📝 Texto transcrito:', result.text);
      console.log('📊 Chunks disponibles:', result.chunks?.length || 0);
      if (result.chunks && result.chunks.length > 0) {
        console.log('🔍 Primer chunk:', result.chunks[0]);
      }
    }

    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Tiempo total de procesamiento: ${processingTime}ms`);
    
    // 9. Preparar respuesta
    const responseData = {
      success: true,
      data: {
        text: result?.text || result || '',
        confidence: 0.9,
        language: 'es',
        processingTime,
        metadata: {
          audioSize: audioFile.size,
          audioType: audioFile.type,
          modelUsed: 'Xenova/whisper-small',
          chunks: result?.chunks?.length || 0
        }
      }
    };
    
    console.log('✅ Respuesta preparada:', responseData);
    
    return NextResponse.json(responseData);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Error completo en transcripción:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      processingTime
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        errorType: error.name,
        processingTime,
        debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para healthcheck
export async function GET() {
  try {
    const modelStatus = whisperPipeline ? 'loaded' : 'not-loaded';
    return NextResponse.json({
      status: 'ok',
      model: modelStatus,
      endpoint: '/api/transcribe',
      methods: ['POST'],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error.message },
      { status: 500 }
    );
  }
}