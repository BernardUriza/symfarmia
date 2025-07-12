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
    } catch (error) {
      console.error('❌ Error cargando modelo Whisper:', error);
      throw error;
    }
  }
  return whisperPipeline;
}

// Función simple para procesar audio (sin conversión compleja)
async function processAudioForWhisper(arrayBuffer, mimeType) {
  console.log('🔊 Procesando audio para Whisper...');
  console.log('📏 Buffer size:', arrayBuffer.byteLength, 'bytes');
  console.log('🎵 MIME type:', mimeType);
  
  if (arrayBuffer.byteLength === 0) {
    throw new Error('Audio buffer está vacío');
  }
  
  // Log de información del audio
  const firstBytes = new Uint8Array(arrayBuffer.slice(0, 16));
  console.log('🔍 Primeros bytes:', Array.from(firstBytes).map(b => b.toString(16).padStart(2, '0')).join(' '));
  
  // Intentar diferentes formatos para Whisper
  const audioFormats = [
    () => {
      console.log('🔄 Intentando formato: ArrayBuffer directo');
      return arrayBuffer;
    },
    () => {
      console.log('🔄 Intentando formato: Uint8Array');
      return new Uint8Array(arrayBuffer);
    },
    () => {
      console.log('🔄 Intentando formato: Buffer de Node.js');
      return Buffer.from(arrayBuffer);
    }
  ];
  
  // Retornar el primer formato (Whisper debería manejar ArrayBuffer)
  return audioFormats[0]();
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

    // 2. Convertir a ArrayBuffer
    const arrayBuffer = await audioFile.arrayBuffer();
    
    // 3. Procesar audio
    const processedAudio = await processAudioForWhisper(arrayBuffer, audioFile.type);
    
    // 4. Inicializar Whisper
    console.log('🤖 Inicializando Whisper...');
    const whisper = await initializeWhisper();
    
    // 5. Configuración de transcripción
    const transcriptionConfig = {
      language: 'spanish',
      task: 'transcribe',
      return_timestamps: false,
      chunk_length_s: 30,
      stride_length_s: 5
    };
    
    console.log('⚙️ Configuración:', transcriptionConfig);
    
    // 6. Transcribir con múltiples intentos
    console.log('🎙️ Iniciando transcripción...');
    
    let result = null;
    const attempts = [
      // Intento 1: Configuración estándar
      async () => {
        console.log('🔄 Intento 1: Configuración estándar');
        return await whisper(processedAudio, transcriptionConfig);
      },
      // Intento 2: Sin configuración de idioma
      async () => {
        console.log('🔄 Intento 2: Sin idioma específico');
        return await whisper(processedAudio, {
          task: 'transcribe',
          return_timestamps: false
        });
      },
      // Intento 3: Solo el audio
      async () => {
        console.log('🔄 Intento 3: Solo audio, configuración mínima');
        return await whisper(processedAudio);
      }
    ];
    
    for (const attempt of attempts) {
      try {
        result = await attempt();
        console.log('📤 Resultado obtenido:', result);
        
        if (result && (result.text || typeof result === 'string')) {
          console.log('✅ Transcripción exitosa');
          break;
        } else {
          console.warn('⚠️ Resultado sin texto, intentando siguiente método...');
        }
      } catch (error) {
        console.warn('⚠️ Intento falló:', error.message);
      }
    }
    
    if (!result) {
      throw new Error('Todos los intentos de transcripción fallaron');
    }
    
    // 7. Procesar resultado
    const transcribedText = result?.text || result || '';
    const processingTime = Date.now() - startTime;
    
    console.log('📊 Resultado final:', {
      text: transcribedText,
      length: transcribedText.length,
      processingTime
    });
    
    const responseData = {
      success: true,
      data: {
        text: transcribedText,
        confidence: 0.9,
        language: 'es',
        processingTime,
        metadata: {
          audioSize: audioFile.size,
          audioType: audioFile.type,
          modelUsed: 'Xenova/whisper-small',
          attempts: attempts.length
        }
      }
    };
    
    return NextResponse.json(responseData);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Error en transcripción:', {
      message: error.message,
      stack: error.stack,
      processingTime
    });
    
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