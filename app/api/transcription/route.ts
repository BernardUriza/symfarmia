/**
 * 🎙️ Endpoint de Transcripción - Proxy a SusurroTest
 * Maneja audio desde frontend, procesa y envía a microservicio
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, readFile } from 'fs/promises';
import { spawn } from 'child_process';
import path from 'path';
import { tmpdir } from 'os';

// Configuración del microservicio
const SUSURRO_CONFIG = {
  baseUrl: process.env.SUSURRO_SERVICE_URL || 'http://localhost:3001',
  endpoint: '/api/transcribe-upload',
  timeout: 30000, // 30 segundos
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['audio/wav', 'audio/webm', 'audio/webm;codecs=opus', 'audio/mp3', 'audio/m4a']
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

    // 🔄 Verificar tipo de archivo y procesar si es necesario
    let processedFile = audioFile;
    const fileType = audioFile.type;
    const isWavFile = fileType === 'audio/wav' || fileType === 'audio/wave';
    
    // Si no es WAV, necesitamos convertir
    if (!isWavFile && fileType.startsWith('audio/')) {
      console.log(`🔄 [Transcription API] Convirtiendo ${fileType} a WAV...`);
      try {
        processedFile = await convertToWAV(audioFile);
        console.log(`✅ [Transcription API] Conversión exitosa`);
      } catch (convError) {
        console.log(`⚠️ [Transcription API] Error al convertir, usando archivo original:`, convError);
        // Intentar con el archivo original si la conversión falla
      }
    } else if (isWavFile) {
      console.log(`✅ [Transcription API] Archivo ya es WAV`);
    } else {
      console.log(`⚠️ [Transcription API] Tipo no reconocido: ${fileType}`);
    }

    // 🌐 Preparar FormData para microservicio
    const susurroFormData = new FormData();
    susurroFormData.append('audio', processedFile);
    susurroFormData.append('language', 'es'); // Español por defecto para contexto médico

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

    if (error instanceof Error) {
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

// 🔄 Función para convertir audio a WAV usando FFmpeg
async function convertToWAV(audioFile: File): Promise<File> {
  const tempDir = tmpdir();
  const inputPath = path.join(tempDir, `input-${Date.now()}-${audioFile.name}`);
  const outputPath = path.join(tempDir, `output-${Date.now()}.wav`);
  
  try {
    // Guardar archivo temporal
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    await writeFile(inputPath, buffer);
    
    // Convertir usando FFmpeg
    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', inputPath,
        '-acodec', 'pcm_s16le',
        '-ac', '1',
        '-ar', '16000',
        '-y',
        outputPath
      ]);
      
      ffmpeg.on('error', (err) => {
        console.error('❌ [FFmpeg] Error al ejecutar:', err);
        reject(new Error('FFmpeg no disponible'));
      });
      
      ffmpeg.stderr.on('data', (data) => {
        console.log(`🔧 [FFmpeg] ${data}`);
      });
      
      ffmpeg.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`FFmpeg exitó con código ${code}`));
        } else {
          resolve();
        }
      });
    });
    
    // Leer archivo convertido
    const wavBuffer = await readFile(outputPath);
    const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
    const wavFile = new File([wavBlob], 'audio.wav', { type: 'audio/wav' });
    
    // Limpiar archivos temporales
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
    
    return wavFile;
    
  } catch (error) {
    // Limpiar en caso de error
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
    throw error;
  }
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