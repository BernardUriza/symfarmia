import { getCORSHeaders } from './utils/whisper-transformer.js';

export const handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...getCORSHeaders()
    },
    body: JSON.stringify({
      status: 'OK',
      service: 'nodejs-whisper Netlify Functions',
      library: 'nodejs-whisper (serverless adaptation)',
      timestamp: new Date().toISOString(),
      endpoints: [
        'POST /.netlify/functions/transcribe-server-file',
        'POST /.netlify/functions/transcribe-upload',
        'GET /.netlify/functions/health'
      ],
      environment: 'production',
      nodeVersion: process.version
    })
  };
};