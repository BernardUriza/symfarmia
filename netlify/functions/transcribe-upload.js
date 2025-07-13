const multipart = require('lambda-multipart-parser');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { 
  transcribeAudio, 
  validateAudioFile, 
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

  let tempPath = null;
  
  try {
    // Parse multipart data
    const result = await multipart.parse(event);
    
    if (!result.files || !result.files.audio) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          ...getCORSHeaders()
        },
        body: JSON.stringify({ 
          error: 'No se subió ningún archivo de audio',
          help: 'Envíe un archivo de audio con el campo "audio" en multipart/form-data'
        })
      };
    }

    const audioFile = result.files.audio;
    
    // Validate audio file
    validateAudioFile(audioFile);
    
    // Create temporary file
    const tempDir = os.tmpdir();
    const tempFileName = `audio-${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(audioFile.filename)}`;
    tempPath = path.join(tempDir, tempFileName);
    
    // Write temporary file
    await fs.writeFile(tempPath, audioFile.content);

    console.log(`[${new Date().toISOString()}] Processing: ${audioFile.filename}`);
    console.log(`[${new Date().toISOString()}] Size: ${audioFile.content.length} bytes`);
    console.log(`[${new Date().toISOString()}] Language: ${result.fields?.language || 'auto'}`);
    
    const startTime = Date.now();
    
    // Transcribe using shared utility
    const transcriptionResult = await transcribeAudio(tempPath, {
      language: result.fields?.language || null
    });

    const processingTime = Date.now() - startTime;
    const transcriptText = transcriptionResult.text || '';

    console.log(`[${new Date().toISOString()}] Transcription completed in ${processingTime}ms`);
    console.log(`[${new Date().toISOString()}] Text length: ${transcriptText.length} chars`);

    // Clean up temporary file
    try {
      await fs.unlink(tempPath);
      tempPath = null;
      console.log(`[${new Date().toISOString()}] Temporary file deleted`);
    } catch (cleanupError) {
      console.error('Error deleting temporary file:', cleanupError);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...getCORSHeaders()
      },
      body: JSON.stringify({
        success: true,
        filename: audioFile.filename,
        original_name: audioFile.filename,
        transcript: transcriptText,
        processing_time_ms: processingTime,
        file_size: audioFile.content.length,
        model_used: 'Xenova/whisper-tiny (Transformers.js)',
        timestamp: new Date().toISOString(),
        confidence: 0.95, // Default confidence
        language: result.fields?.language || 'auto-detected'
      })
    };

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error);
    console.error(`[${new Date().toISOString()}] Error stack:`, error.stack);
    
    // Clean up temporary file on error
    if (tempPath) {
      try {
        await fs.unlink(tempPath);
      } catch (cleanupError) {
        console.error('Error cleaning up on failure:', cleanupError);
      }
    }
    
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