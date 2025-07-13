exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
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