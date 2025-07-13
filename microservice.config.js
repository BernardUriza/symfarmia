/**
 * 🎙️ SusurroTest Configuration for SYMFARMIA
 * 
 * Simple configuration that points to your existing microservice
 */

export const susurroConfig = {
  // Reference to existing microservice
  microservice: {
    directory: './microservices/susurro-test',
    port: 3001,
    name: 'susurro-transcription-service',
    health: '/api/health',
    transcription: '/api/transcribe-upload'
  },

  // Integration with Next.js
  integration: {
    nextjsProxy: '/api/transcribe-upload',
    envVars: {
      SUSURRO_SERVICE_URL: 'http://localhost:3001',
      TRANSCRIPTION_TIMEOUT: '30000',
      MAX_FILE_SIZE: '50000000'
    }
  },

  // Development scripts
  scripts: {
    startBoth: 'concurrently "npm run dev" "npm run dev:susurro"',
    devSusurro: 'cd microservices/susurro-test && npm run dev',
    setupSusurro: 'cd microservices/susurro-test && npm run setup',
    healthCheck: 'curl -f http://localhost:3001/api/health'
  }
};

export default susurroConfig;