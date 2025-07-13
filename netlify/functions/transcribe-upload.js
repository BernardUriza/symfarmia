const { nodewhisper } = require('nodejs-whisper');
const multipart = require('lambda-multipart-parser');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const os = require('os');

// In Netlify Functions, we'll use the models from public/models/
console.log('📁 [Init] Using nodejs-whisper with pre-existing models');

// Function to ensure model is available
async function ensureModel() {
  // In Netlify, public files are at the root level
  const sourceModelPath = path.join(process.cwd(), 'public', 'models', 'ggml-base.bin');
  const sourceModelEnPath = path.join(process.cwd(), 'public', 'models', 'ggml-base.en.bin');
  
  // Create models directory in temp if it doesn't exist
  const tempModelsDir = path.join(os.tmpdir(), 'whisper-models');
  
  try {
    await fs.mkdir(tempModelsDir, { recursive: true });
    
    // Check if we need to copy the model
    const targetModelPath = path.join(tempModelsDir, 'ggml-base.bin');
    const targetModelEnPath = path.join(tempModelsDir, 'ggml-base.en.bin');
    
    // Copy multilingual model if not exists
    if (!fsSync.existsSync(targetModelPath) && fsSync.existsSync(sourceModelPath)) {
      console.log('📦 Copying multilingual base model to temp...');
      await fs.copyFile(sourceModelPath, targetModelPath);
      console.log('✅ Model copied successfully');
    }
    
    // Copy English model if not exists
    if (!fsSync.existsSync(targetModelEnPath) && fsSync.existsSync(sourceModelEnPath)) {
      console.log('📦 Copying English base model to temp...');
      await fs.copyFile(sourceModelEnPath, targetModelEnPath);
      console.log('✅ English model copied successfully');
    }
    
    return tempModelsDir;
  } catch (error) {
    console.error('❌ Error setting up models:', error);
    throw error;
  }
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
    console.log(`[${new Date().toISOString()}] Verificando que el archivo existe...`);
    
    // Verificar que el archivo temporal existe
    const fileExists = await fs.access(tempPath).then(() => true).catch(() => false);
    console.log(`[${new Date().toISOString()}] Archivo temporal existe: ${fileExists}`);
    
    if (!fileExists) {
      throw new Error(`Archivo temporal no existe: ${tempPath}`);
    }
    
    console.log(`[${new Date().toISOString()}] Iniciando transcripción...`);
    
    // Ensure model is available
    const modelPath = await ensureModel();
    console.log(`[${new Date().toISOString()}] Using model path: ${modelPath}`);
    
    const startTime = Date.now();
    
    // Usar nodejs-whisper para transcribir con modelo pre-existente
    const transcriptionResult = await nodewhisper(tempPath, {
      modelName: 'base', // Use the base model from public/models/
      modelPath: modelPath,
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
    if (error.message && error.message.includes('model') || error.message.includes('path')) {
      console.error('🔍 Model-related error detected');
      console.error('🔍 Checking pre-existing model locations...');
      try {
        const publicModelsPath = path.join(process.cwd(), 'public', 'models');
        const tempModelsPath = path.join(os.tmpdir(), 'whisper-models');
        
        console.error(`🔍 Public models path ${publicModelsPath}:`, fsSync.existsSync(publicModelsPath) ? 'EXISTS' : 'NOT FOUND');
        if (fsSync.existsSync(publicModelsPath)) {
          console.error('🔍 Public models:', fsSync.readdirSync(publicModelsPath));
        }
        
        console.error(`🔍 Temp models path ${tempModelsPath}:`, fsSync.existsSync(tempModelsPath) ? 'EXISTS' : 'NOT FOUND');
        if (fsSync.existsSync(tempModelsPath)) {
          console.error('🔍 Temp models:', fsSync.readdirSync(tempModelsPath));
        }
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