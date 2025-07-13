import multipart from "lambda-multipart-parser";
import {
  transcribeAudio,
  validateAudioFile,
  getErrorResponse,
  getCORSHeaders,
} from "./utils/whisper-transformer.js";

export const handler = async (event, context) => {
  console.log('🎙️ Transcribe-upload function called:', event.httpMethod);
  
  const corsHeaders = getCORSHeaders();

  // Handle OPTIONS for CORS
  if (event.httpMethod === "OPTIONS") {
    console.log('✅ Handling CORS preflight');
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  // Only accept POST
  if (event.httpMethod !== "POST") {
    console.log('❌ Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    console.log('📦 Parsing multipart data...');
    // Parse multipart data
    const result = await multipart.parse(event);
    console.log('📋 Files received:', result.files ? Object.keys(result.files) : 'No files');

    // Manejo robusto del archivo subido (por nombre o por primer archivo)
    const audioFile = Array.isArray(result.files)
      ? result.files.find((f) => f.fieldname === "audio") || result.files[0]
      : result.files.audio;

    if (!audioFile) {
      console.log('❌ No audio file found in request');
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        body: JSON.stringify({
          error: "No se subió ningún archivo de audio",
          help: 'Envíe un archivo de audio con el campo "audio" en multipart/form-data',
        }),
      };
    }

    // Validate audio file
    console.log(`🎵 Audio file received: ${audioFile.filename} (${(audioFile.content.length / 1024).toFixed(2)} KB)`);
    validateAudioFile(audioFile);

    const startTime = Date.now();

    // Transcribe directly from buffer
    console.log('🔄 Starting transcription...');
    const transcriptionResult = await transcribeAudio(audioFile.content, {
      language: result.fields?.language || null,
    });
    console.log('✅ Transcription completed!');

    const processingTime = Date.now() - startTime;
    const transcriptText = transcriptionResult.text || "";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        ...corsHeaders,
      },
      body: JSON.stringify({
        success: true,
        filename: audioFile.filename,
        original_name: audioFile.filename,
        transcript: transcriptText,
        processing_time_ms: processingTime,
        file_size: audioFile.content.length,
        model_used: "Xenova/whisper-tiny (Transformers.js)",
        timestamp: new Date().toISOString(),
        confidence: 0.95, // Default confidence
        language: result.fields?.language || "auto-detected",
      }),
    };
  } catch (error) {
    console.error('🚨 Error in transcribe-upload:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Get standardized error response
    const { statusCode, errorResponse } = getErrorResponse(error);

    return {
      statusCode,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      body: JSON.stringify(errorResponse),
    };
  }
};