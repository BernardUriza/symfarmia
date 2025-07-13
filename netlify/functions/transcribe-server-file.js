const { nodewhisper } = require('nodejs-whisper');
const path = require('path');
const fs = require('fs');

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
    const { filename } = JSON.parse(event.body || '{}');
    
    if (!filename) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Se requiere el nombre del archivo',
          example: { "filename": "sample.wav" }
        })
      };
    }

    // En Netlify Functions, usar archivos estáticos del build
    // Los archivos públicos están disponibles en el directorio de trabajo
    const audioPath = path.join(process.cwd(), 'public', 'test-audio', filename);
    
    if (!fs.existsSync(audioPath)) {
      // Intentar también en la raíz del proyecto
      const altPath = path.join(process.cwd(), 'test-audio', filename);
      if (!fs.existsSync(altPath)) {
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            error: 'Archivo no encontrado',
            path: audioPath,
            alternativePath: altPath,
            workingDirectory: process.cwd()
          })
        };
      }
      // Usar la ruta alternativa si existe
      audioPath = altPath;
    }

    console.log(`[${new Date().toISOString()}] Procesando: ${audioPath}`);
    
    const startTime = Date.now();
    
    // Usar nodejs-whisper igual que en el microservicio
    const result = await nodewhisper(audioPath, {
      modelName: 'tiny.en',
      removeWavFileAfterTranscription: false,
      whisperOptions: {
        wordTimestamps: true,
        outputInJson: true,
        language: 'en'
      }
    });

    const processingTime = Date.now() - startTime;
    const transcriptText = result.text || result || '';

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
        filename: filename,
        transcript: transcriptText,
        raw_result: result,
        processing_time_ms: processingTime,
        audio_path: audioPath,
        model_used: 'nodejs-whisper tiny.en (Netlify Function)',
        timestamp: new Date().toISOString()
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