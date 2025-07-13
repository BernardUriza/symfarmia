import { readFile } from "fs/promises";
import { pipeline } from "@xenova/transformers";

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const { filePath } = JSON.parse(event.body);
    
    if (!filePath) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "File path is required" })
      };
    }

    // Read the audio file
    const audioData = await readFile(filePath);
    
    // Initialize transcription pipeline
    const transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-tiny");
    
    // Process the audio file
    const transcription = await transcriber(audioData, {
      return_timestamps: true
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        text: transcription.text,
        chunks: transcription.chunks
      })
    };
  } catch (error) {
    console.error("Transcription error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Transcription failed",
        details: error.message 
      })
    };
  }
};