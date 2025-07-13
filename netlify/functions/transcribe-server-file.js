const path = require('path');
const fs = require('fs');
const { 
  transcribeAudio, 
  getErrorResponse, 
  getCORSHeaders 
} = require('./utils/whisper-transformer');

exports.handler = async (event, context) => {
  // Handle OPTIONS for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCORSHeaders(),
      body: ''
    };
  }

  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders()
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { filename, language } = JSON.parse(event.body || '{}');
    
    if (!filename) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          ...getCORSHeaders()
        },
        body: JSON.stringify({ 
          error: 'Se requiere el nombre del archivo',
          example: { "filename": "sample.wav", "language": "es" }
        })
      };
    }

    // In Netlify Functions, use static files from build
    // Public files are available in the working directory
    let audioPath = path.join(process.cwd(), 'public', 'test-audio', filename);
    
    if (!fs.existsSync(audioPath)) {
      // Also try in project root
      const altPath = path.join(process.cwd(), 'test-audio', filename);
      if (!fs.existsSync(altPath)) {
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            ...getCORSHeaders()
          },
          body: JSON.stringify({ 
            error: 'Archivo no encontrado',
            path: audioPath,
            alternativePath: altPath,
            workingDirectory: process.cwd(),
            availableFiles: fs.existsSync(path.dirname(audioPath)) 
              ? fs.readdirSync(path.dirname(audioPath)) 
              : []
          })
        };
      }
      // Use alternative path if exists
      audioPath = altPath;
    }

    console.log(`[${new Date().toISOString()}] Processing: ${audioPath}`);
    console.log(`[${new Date().toISOString()}] Language: ${language || 'auto'}`);
    
    // Get file stats for validation
    const stats = fs.statSync(audioPath);
    const fileSizeMB = stats.size / (1024 * 1024);
    
    if (fileSizeMB > 10) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          ...getCORSHeaders()
        },
        body: JSON.stringify({ 
          error: `El archivo excede el límite de 10MB (${fileSizeMB.toFixed(2)}MB)`,
          filename: filename
        })
      };
    }
    
    const startTime = Date.now();
    
    // Transcribe using shared utility
    const result = await transcribeAudio(audioPath, {
      language: language || null
    });

    const processingTime = Date.now() - startTime;
    const transcriptText = result.text || '';

    console.log(`[${new Date().toISOString()}] Transcription completed in ${processingTime}ms`);
    console.log(`[${new Date().toISOString()}] Text length: ${transcriptText.length} chars`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...getCORSHeaders()
      },
      body: JSON.stringify({
        success: true,
        filename: filename,
        transcript: transcriptText,
        raw_result: {
          text: transcriptText,
          chunks: result.chunks || []
        },
        processing_time_ms: processingTime,
        audio_path: audioPath,
        model_used: 'Xenova/whisper-tiny (Transformers.js)',
        timestamp: new Date().toISOString(),
        file_size_mb: fileSizeMB.toFixed(2),
        language: language || 'auto-detected'
      })
    };

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error);
    console.error(`[${new Date().toISOString()}] Error stack:`, error.stack);
    
    // Get standardized error response
    const { statusCode, errorResponse } = getErrorResponse(error);
    
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders()
      },
      body: JSON.stringify(errorResponse)
    };
  }
};