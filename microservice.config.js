/**
 * Microservice Migration Configuration
 * 
 * This file contains configuration for extracting the Medical AI service
 * into a standalone microservice.
 */

import { MedicalAIConfig } from './app/config/MedicalAIConfig.js';

export const microserviceConfig = {
  // Service metadata
  service: {
    name: 'medical-ai-service',
    version: '1.0.0',
    description: 'Medical AI consultation service using Hugging Face models',
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost'
  },

  // API configuration
  api: {
    prefix: '/api/v1',
    endpoints: {
      medical: '/medical',
      health: '/health',
      metrics: '/metrics'
    }
  },

  // External service configuration
  externalServices: {
    huggingFace: {
      baseUrl: 'https://api-inference.huggingface.co/models',
      timeout: 10000,
      rateLimits: {
        requests: 100,
        period: 60000 // 1 minute
      }
    }
  },

  // Monitoring and observability
  monitoring: {
    enabled: true,
    healthCheck: {
      enabled: true,
      interval: 30000 // 30 seconds
    },
    metrics: {
      enabled: true,
      path: '/metrics'
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: 'json'
    }
  },

  // Security settings
  security: {
    cors: {
      enabled: true,
      origins: process.env.ALLOWED_ORIGINS?.split(',') || ['*']
    },
    authentication: {
      required: true, // Internal service
      method: 'apiKey'
    },
    rateLimiting: {
      enabled: true,
      maxRequests: 100,
      windowMs: 60000 // 1 minute
    }
  },

  // Migration helpers
  migration: {
    // Files to extract for standalone service
    extractFiles: [
      'app/services/MedicalAIService.js',
      'app/config/MedicalAIConfig.js',
      'app/api/medical/route.js'
    ],
    
    // Dependencies to install
    dependencies: [
      'express',
      'cors',
      'helmet',
      'express-rate-limit',
      'winston',
      'dotenv'
    ],
    
    // Environment variables required
    environmentVariables: [
      'HUGGINGFACE_TOKEN',
      'PORT',
      'HOST',
      'LOG_LEVEL',
      'ALLOWED_ORIGINS'
    ],
    
    // Docker configuration
    docker: {
      baseImage: 'node:18-alpine',
      port: 3001,
      healthCheck: '/health'
    }
  },

  // Get full configuration including AI config
  getFullConfig() {
    return {
      ...this,
      ai: MedicalAIConfig.getMicroserviceConfig()
    };
  }
};

export default microserviceConfig;

// Helper function to generate microservice package.json
export function generateMicroservicePackageJson() {
  return {
    name: 'medical-ai-service',
    version: '1.0.0',
    description: 'Medical AI consultation microservice',
    main: 'index.js',
    scripts: {
      start: 'node index.js',
      dev: 'nodemon index.js',
      test: 'jest',
      'test:watch': 'jest --watch',
      'docker:build': 'docker build -t medical-ai-service .',
      'docker:run': 'docker run -p 3001:3001 medical-ai-service'
    },
    dependencies: {
      express: '^4.18.2',
      cors: '^2.8.5',
      helmet: '^7.0.0',
      'express-rate-limit': '^6.7.0',
      winston: '^3.8.2',
      dotenv: '^16.0.3'
    },
    devDependencies: {
      nodemon: '^2.0.22',
      jest: '^29.5.0',
      supertest: '^6.3.3'
    },
    engines: {
      node: '>=18.0.0'
    }
  };
}

// Helper function to generate Dockerfile
export function generateDockerfile() {
  return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node health-check.js

CMD ["npm", "start"]`;
}

// Helper function to generate standalone Express server
export function generateStandaloneServer() {
  return `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import { MedicalAIService } from './services/MedicalAIService.js';
import { MedicalAIConfig } from './config/MedicalAIConfig.js';
import microserviceConfig from './microservice.config.js';

const app = express();
const port = microserviceConfig.service.port;

// Logger setup
const logger = winston.createLogger({
  level: microserviceConfig.monitoring.logging.level,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});

// Middleware
app.use(helmet());
app.use(cors(microserviceConfig.security.cors));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: microserviceConfig.security.rateLimiting.windowMs,
  max: microserviceConfig.security.rateLimiting.maxRequests
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: microserviceConfig.service.name,
    version: microserviceConfig.service.version
  });
});

// Medical AI endpoint
app.post('/api/v1/medical', async (req, res) => {
  try {
    const { query, context, type } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const medicalAI = new MedicalAIService();
    const result = await medicalAI.processQuery({ query, context, type });
    
    res.json(result);
  } catch (error) {
    logger.error('Medical AI error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  logger.info(\`Medical AI Service listening on port \${port}\`);
});

export default app;`;
}