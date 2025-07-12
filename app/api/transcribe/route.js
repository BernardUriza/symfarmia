import { pipeline } from '@xenova/transformers';
import { NextRequest, NextResponse } from 'next/server';

// Singleton para evitar cargar el modelo en cada request
let whisperPipeline = null;

async function initializeWhisper() {
  if (!whisperPipeline) {
    console.log('🔥 Cargando Whisper model...');
    whisperPipeline = await pipeline(
      'automatic-speech-recognition',
      'Xenova/whisper-small', // Modelo pequeño para latencia
      {
        revision: 'main',
        quantized: true // Reduce RAM usage
      }
    );
    console.log('✅ Whisper model cargado');
  }
  return whisperPipeline;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    
    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'No se recibió archivo de audio' },
        { status: 400 }
      );
    }

    // Convertir audio a ArrayBuffer
    const arrayBuffer = await audioFile.arrayBuffer();
    
    // Inicializar Whisper
    const whisper = await initializeWhisper();
    
    // Transcribir
    console.log('🎙️ Iniciando transcripción...');
    const result = await whisper(arrayBuffer, {
      language: 'spanish',
      task: 'transcribe',
      return_timestamps: false,
      chunk_length_s: 30,
      stride_length_s: 5
    });

    console.log('✅ Transcripción completada');
    
    return NextResponse.json({
      success: true,
      data: {
        text: result.text || '',
        confidence: 0.9, // Whisper no devuelve confidence scores
        language: 'es',
        processingTime: Date.now()
      }
    });

  } catch (error) {
    console.error('❌ Error en transcripción:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
