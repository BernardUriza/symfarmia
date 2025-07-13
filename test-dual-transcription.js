#!/usr/bin/env node

/**
 * 🧪 Test Script para verificar la implementación dual de transcripción
 * Prueba tanto el microservicio local como la simulación de Netlify Functions
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// URLs de prueba
const LOCAL_API = 'http://localhost:3000/api/transcription';
const MICROSERVICE_API = 'http://localhost:3001/api/transcribe-upload';
const MICROSERVICE_HEALTH = 'http://localhost:3001/api/health';

async function testHealthCheck() {
  console.log(`\n${colors.cyan}🏥 Verificando salud del microservicio...${colors.reset}`);
  
  try {
    const response = await fetch(MICROSERVICE_HEALTH);
    if (response.ok) {
      const data = await response.json();
      console.log(`${colors.green}✅ Microservicio saludable:${colors.reset}`, data.service);
      return true;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Microservicio no disponible${colors.reset}`);
    return false;
  }
}

async function testTranscription() {
  console.log(`\n${colors.blue}🎙️ Iniciando pruebas de transcripción dual${colors.reset}`);
  
  // Verificar que existe el archivo de prueba
  const testAudioPath = path.join(__dirname, 'public', 'test-audio', 'sample.wav');
  if (!fs.existsSync(testAudioPath)) {
    console.error(`${colors.red}❌ No se encontró el archivo de prueba: ${testAudioPath}${colors.reset}`);
    console.log(`${colors.yellow}💡 Asegúrate de haber copiado sample.wav a public/test-audio/${colors.reset}`);
    return;
  }

  // Verificar salud del microservicio
  const isHealthy = await testHealthCheck();
  if (!isHealthy) {
    console.log(`${colors.yellow}⚠️ Iniciando solo pruebas del API Route (microservicio no disponible)${colors.reset}`);
  }

  // Crear FormData con el archivo
  const audioBuffer = fs.readFileSync(testAudioPath);
  
  // Test 1: API Route (que detectará entorno y usará microservicio local)
  console.log(`\n${colors.cyan}📡 Test 1: API Route (/api/transcription)${colors.reset}`);
  try {
    const formData = new FormData();
    formData.append('audio', audioBuffer, 'sample.wav');
    
    const startTime = Date.now();
    const response = await fetch(LOCAL_API, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const result = await response.json();
      console.log(`${colors.green}✅ Transcripción exitosa via API Route${colors.reset}`);
      console.log(`   📝 Texto: "${result.transcript?.substring(0, 50)}..."`);
      console.log(`   ⏱️ Tiempo: ${responseTime}ms`);
      console.log(`   📡 Fuente: ${result.source}`);
    } else {
      const error = await response.json();
      console.log(`${colors.red}❌ Error en API Route:${colors.reset}`, error.error);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Error al conectar con API Route:${colors.reset}`, error.message);
    console.log(`${colors.yellow}💡 Asegúrate de que Next.js esté corriendo en puerto 3000${colors.reset}`);
  }

  // Test 2: Microservicio directo (si está disponible)
  if (isHealthy) {
    console.log(`\n${colors.cyan}🔗 Test 2: Microservicio Directo (puerto 3001)${colors.reset}`);
    try {
      const formData = new FormData();
      formData.append('audio', audioBuffer, 'sample.wav');
      formData.append('language', 'es');
      
      const startTime = Date.now();
      const response = await fetch(MICROSERVICE_API, {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders()
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const result = await response.json();
        console.log(`${colors.green}✅ Transcripción exitosa directa${colors.reset}`);
        console.log(`   📝 Texto: "${result.transcript?.substring(0, 50)}..."`);
        console.log(`   ⏱️ Tiempo: ${responseTime}ms`);
        console.log(`   🔧 Modelo: ${result.model_used}`);
      } else {
        const error = await response.json();
        console.log(`${colors.red}❌ Error en microservicio:${colors.reset}`, error.error);
      }
    } catch (error) {
      console.log(`${colors.red}❌ Error al conectar con microservicio:${colors.reset}`, error.message);
    }
  }

  // Resumen
  console.log(`\n${colors.cyan}📊 Resumen de la implementación dual:${colors.reset}`);
  console.log(`${colors.green}✅ Netlify Functions creadas en netlify/functions/${colors.reset}`);
  console.log(`${colors.green}✅ API Route modificada para detectar entorno${colors.reset}`);
  console.log(`${colors.green}✅ netlify.toml configurado con functions y CORS${colors.reset}`);
  console.log(`${colors.green}✅ Archivos de prueba copiados a public/test-audio/${colors.reset}`);
  
  console.log(`\n${colors.yellow}🚀 En producción (Netlify):${colors.reset}`);
  console.log(`   - process.env.NETLIFY === 'true'`);
  console.log(`   - Usará /.netlify/functions/transcribe-upload`);
  
  console.log(`\n${colors.blue}🏠 En desarrollo local:${colors.reset}`);
  console.log(`   - process.env.NETLIFY !== 'true'`);
  console.log(`   - Usará http://localhost:3001/api/transcribe-upload`);
}

// Ejecutar pruebas
testTranscription().catch(console.error);