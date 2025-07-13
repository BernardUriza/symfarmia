const { nodewhisper } = require('nodejs-whisper');
const multipart = require('lambda-multipart-parser');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

exports.handler = async (event, context) => {
  // Solo acepta POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  try {
    // Parsear multipart data
    const result = await multipart.parse(event);
    
    if (!result.files || !result.files.audio) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'No se subió ningún archivo de audio',
          help: 'Envíe un archivo de audio con el campo "audio" en multipart/form-data'
        })
      };
    }

    const audioFile = result.files.audio;
    
    // Crear archivo temporal
    const tempDir = os.tmpdir();
    const tempFileName = `audio-${Date.now()}-${Math.random().toString(36).substring(7)}.wav`;
    const tempPath = path.join(tempDir, tempFileName);
    
    // Escribir el archivo temporal
    await fs.writeFile(tempPath, audioFile.content);

    console.log(`[${new Date().toISOString()}] Archivo subido: ${audioFile.filename}`);
    console.log(`[${new Date().toISOString()}] Tamaño: ${audioFile.content.length} bytes`);
    console.log(`[${new Date().toISOString()}] Archivo temporal: ${tempPath}`);
    
    const startTime = Date.now();
    
    // Usar nodejs-whisper para transcribir
    const transcriptionResult = await nodewhisper(tempPath, {
      modelName: 'tiny.en',
      removeWavFileAfterTranscription: false,
      whisperOptions: {
        wordTimestamps: true,
        outputInJson: true,
        language: result.fields?.language || 'es' // Usar español por defecto
      }
    });

    const processingTime = Date.now() - startTime;
    const transcriptText = transcriptionResult.text || transcriptionResult || '';

    console.log(`[${new Date().toISOString()}] Transcripción completada en ${processingTime}ms`);

    // Limpiar archivo temporal
    try {
      await fs.unlink(tempPath);
      console.log(`[${new Date().toISOString()}] Archivo temporal eliminado`);
    } catch (cleanupError) {
      console.error('Error al eliminar archivo temporal:', cleanupError);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: true,
        filename: audioFile.filename,
        original_name: audioFile.filename,
        transcript: transcriptText,
        processing_time_ms: processingTime,
        file_size: audioFile.content.length,
        model_used: 'nodejs-whisper tiny.en (Netlify Function)',
        timestamp: new Date().toISOString(),
        confidence: 0.95 // nodejs-whisper no devuelve confidence, usar valor por defecto
      })
    };

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Error al transcribir el archivo',
        details: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};