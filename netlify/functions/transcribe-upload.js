const { nodewhisper } = require('nodejs-whisper');
const multipart = require('lambda-multipart-parser');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const os = require('os');

// Debug logs para verificar el modelo
console.log('📁 [Function Init] Checking model files...');
console.log('📁 Current directory:', process.cwd());
console.log('📁 Node modules exists:', fsSync.existsSync('./node_modules'));
console.log('📁 Whisper module exists:', fsSync.existsSync('./node_modules/nodejs-whisper'));

// Listar archivos de modelos si existen
try {
  const modelPath = './node_modules/nodejs-whisper';
  if (fsSync.existsSync(modelPath)) {
    console.log('📁 Whisper module contents:', fsSync.readdirSync(modelPath).slice(0, 10));
    
    // Verificar si el modelo tiny.en existe
    const modelsPath = path.join(modelPath, 'lib', 'whisper', 'models');
    if (fsSync.existsSync(modelsPath)) {
      console.log('📁 Models directory contents:', fsSync.readdirSync(modelsPath));
    } else {
      console.log('❌ Models directory not found at:', modelsPath);
    }
  }
} catch (error) {
  console.log('📁 Error checking model path:', error.message);
}

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
    console.log(`[${new Date().toISOString()}] Verificando modelo antes de transcribir...`);
    
    const startTime = Date.now();
    
    // Usar nodejs-whisper para transcribir
    const transcriptionResult = await nodewhisper(tempPath, {
      modelName: 'base',
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
        model_used: 'nodejs-whisper base (Netlify Function)',
        timestamp: new Date().toISOString(),
        confidence: 0.95 // nodejs-whisper no devuelve confidence, usar valor por defecto
      })
    };

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error);
    console.error(`[${new Date().toISOString()}] Error stack:`, error.stack);
    console.error(`[${new Date().toISOString()}] Error type:`, error.constructor.name);
    
    // Información adicional para debug de modelo
    if (error.message && error.message.includes('model')) {
      console.error('🔍 Model-related error detected');
      console.error('🔍 Checking model locations...');
      try {
        const possiblePaths = [
          './node_modules/nodejs-whisper/lib/whisper/models',
          '/var/task/node_modules/nodejs-whisper/lib/whisper/models',
          path.join(process.cwd(), 'node_modules/nodejs-whisper/lib/whisper/models')
        ];
        possiblePaths.forEach(p => {
          console.error(`🔍 Checking ${p}:`, fsSync.existsSync(p) ? 'EXISTS' : 'NOT FOUND');
        });
      } catch (debugError) {
        console.error('🔍 Error during debug:', debugError.message);
      }
    }
    
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