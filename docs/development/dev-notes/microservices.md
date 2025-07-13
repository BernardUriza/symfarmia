# 🔧 Microservicios de SYMFARMIA

## 📋 Índice
- [Arquitectura General](#arquitectura-general)
- [Microservicio 1: Susurro-Test](#microservicio-1-susurro-test-transcripción-de-audio)
- [Microservicio 2: Servidor de Desarrollo Permanente](#microservicio-2-servidor-de-desarrollo-permanente)
- [Microservicio 3: Medical AI Service](#microservicio-3-medical-ai-service-planificado)
- [Gestión de Puertos](#gestión-de-puertos)
- [Troubleshooting](#troubleshooting)

## 🏗️ Arquitectura General

### Visión General
SYMFARMIA utiliza una arquitectura de microservicios para separar responsabilidades y permitir escalabilidad independiente de cada componente.

### Distribución de Puertos
```
Puerto 3000: Aplicación principal Next.js
Puerto 3001: Microservicio de transcripción (Susurro-Test)
Puerto 3002: Servidor de desarrollo permanente
Puerto 3003: [Reservado] Medical AI Service
```

### Comunicación entre Servicios
- **Protocolo**: REST API sobre HTTP
- **Formato**: JSON
- **Autenticación**: Tokens compartidos (en desarrollo)
- **CORS**: Habilitado para desarrollo local

## 🎤 Microservicio 1: Susurro-Test (Transcripción de Audio)

### Descripción
Servicio especializado en transcripción de audio médico utilizando nodejs-whisper para convertir grabaciones de voz en texto.

### Información Técnica
- **Puerto**: 3001
- **Ubicación**: `/microservices/susurro-test/`
- **Tecnología**: Node.js + Express + nodejs-whisper
- **Modelo**: whisper-base (configurable)
- **Límite de audio**: 30 segundos por archivo

### Instalación y Arranque
```bash
# Navegar al directorio del microservicio
cd microservices/susurro-test

# Instalar dependencias
npm install

# Iniciar el servicio
npm start

# O ejecutar directamente
node server.js
```

### Endpoints Disponibles

#### 1. Health Check
```bash
GET http://localhost:3001/api/health

# Ejemplo con curl
curl http://localhost:3001/api/health

# Respuesta esperada
{
  "status": "ok",
  "message": "Whisper transcription service is running",
  "timestamp": "2025-07-12T10:00:00.000Z"
}
```

#### 2. Listar Archivos Disponibles
```bash
GET http://localhost:3001/api/files

# Ejemplo con curl
curl http://localhost:3001/api/files

# Respuesta esperada
{
  "files": [
    "sample1.wav",
    "consultation-2025-07-12.mp3"
  ]
}
```

#### 3. Transcribir Archivo Subido
```bash
POST http://localhost:3001/api/transcribe-upload
Content-Type: multipart/form-data

# Ejemplo con curl
curl -X POST \
  -F "audio=@/path/to/audio.wav" \
  http://localhost:3001/api/transcribe-upload

# Respuesta esperada
{
  "success": true,
  "transcription": "El paciente presenta síntomas de...",
  "duration": 2.5,
  "model": "base"
}
```

#### 4. Transcribir Archivo del Servidor
```bash
POST http://localhost:3001/api/transcribe-server-file
Content-Type: application/json

# Ejemplo con curl
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"filename": "sample1.wav"}' \
  http://localhost:3001/api/transcribe-server-file

# Respuesta esperada
{
  "success": true,
  "transcription": "Texto transcrito del archivo...",
  "filename": "sample1.wav"
}
```

### Configuración
El servicio se configura mediante variables de entorno y el archivo `config.js`:

```javascript
// microservices/susurro-test/config.js
module.exports = {
  port: process.env.WHISPER_PORT || 3001,
  model: process.env.WHISPER_MODEL || 'base',
  maxDuration: 30, // segundos
  allowedFormats: ['.wav', '.mp3', '.m4a', '.ogg']
};
```

### Casos de Uso
1. **Transcripción de consultas médicas**: Grabar y transcribir conversaciones doctor-paciente
2. **Notas de voz**: Convertir notas de audio de médicos en texto
3. **Dictado médico**: Transcribir informes médicos dictados

## 🖥️ Microservicio 2: Servidor de Desarrollo Permanente

### Descripción
Servidor de desarrollo estable que permanece activo en segundo plano, permitiendo pruebas continuas incluso con errores de TypeScript.

### Información Técnica
- **Puerto**: 3002
- **Script**: `/scripts/permanent-dev-server.sh`
- **Características**: Bypass de errores TypeScript, logs persistentes
- **PID File**: `/tmp/symfarmia-permanent-dev.pid`
- **Log File**: `/tmp/symfarmia-permanent-dev.log`

### Comandos de Gestión
```bash
# Iniciar servidor permanente
npm run permanent:start

# Verificar estado
npm run permanent:status

# Detener servidor
npm run permanent:stop

# Reiniciar servidor
npm run permanent:restart

# Ver logs en tiempo real
npm run permanent:logs
```

### Funcionamiento Interno
```bash
# El script internamente ejecuta:
nohup npm run dev:nocheck > /tmp/symfarmia-permanent-dev.log 2>&1 &

# Donde dev:nocheck es:
next dev -p 3002
```

### Casos de Uso
1. **Pruebas continuas**: Mantener servidor activo para QA
2. **Demos**: Servidor estable para presentaciones
3. **Desarrollo paralelo**: Trabajar en features mientras el servidor principal está ocupado
4. **CI/CD**: Integración con pipelines de testing

### Monitoreo
```bash
# Verificar si el proceso está activo
ps aux | grep "next dev -p 3002"

# Ver últimas líneas del log
tail -f /tmp/symfarmia-permanent-dev.log

# Verificar uso de puerto
lsof -i :3002
```

## 🤖 Microservicio 3: Medical AI Service (Planificado)

### Estado: 🚧 En Planificación

### Descripción
Servicio dedicado para procesamiento de IA médica, separando la lógica de IA del servidor principal.

### Información Técnica Planificada
- **Puerto**: 3001 (compartido temporalmente)
- **Configuración**: `/microservice.config.js`
- **Tecnologías**: Express, Hugging Face API, Winston logging
- **Modelo**: Meta-Llama-3-8B-Instruct

### Configuración Preparada
```javascript
// microservice.config.js
module.exports = {
  port: process.env.PORT || 3001,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  services: {
    medical: {
      baseUrl: '/api/v1',
      endpoints: ['/medical', '/health', '/metrics']
    }
  }
};
```

### Endpoints Planificados
- `GET /api/v1/health` - Health check del servicio
- `POST /api/v1/medical` - Procesamiento de consultas médicas
- `GET /api/v1/metrics` - Métricas de uso y rendimiento

### Roadmap de Implementación
1. **Fase 1**: Extraer lógica de IA del monolito
2. **Fase 2**: Implementar caché y rate limiting
3. **Fase 3**: Añadir autenticación y autorización
4. **Fase 4**: Implementar métricas y logging avanzado
5. **Fase 5**: Dockerizar y preparar para producción

## 🔧 Gestión de Puertos

### Script de Limpieza
Ubicación: `/scripts/kill-ports.js`

```bash
# Ejecutar manualmente
node scripts/kill-ports.js

# O usar el comando npm
npm run kill:ports
```

### Funcionamiento
El script automáticamente:
1. Detecta procesos en puertos 3000 y 3001
2. Intenta terminarlos gracefully
3. Fuerza terminación si es necesario
4. Reporta el estado de cada puerto

### Resolución Manual de Conflictos
```bash
# Ver qué proceso usa un puerto
lsof -i :3000

# Matar proceso por PID
kill -9 [PID]

# Verificar puertos libres
netstat -tulpn | grep LISTEN
```

## 🧪 Pruebas End-to-End (E2E)

### Guardian de Microservicios E2E
El sistema incluye un guardian automatizado que valida el funcionamiento del microservicio antes de permitir builds.

#### Ejecución Manual
```bash
# Ejecutar prueba E2E del microservicio
npm run test:microservice

# Ejecutar prueba específica de Susurro-Test
npm run test:microservice:susurro
```

#### Integración con Build Guardian
El `build-guardian.js` ejecuta automáticamente las pruebas E2E del microservicio:
1. Verifica si el microservicio está activo
2. Lo inicia si es necesario
3. Ejecuta prueba de transcripción
4. Verifica que la palabra "Americans" esté en la transcripción
5. Detiene el servicio si lo inició

#### Criterios de Éxito
- ✅ Servidor responde al health check
- ✅ Transcripción completa en menos de 30 segundos
- ✅ La transcripción contiene la palabra "Americans"
- ✅ El modelo de Whisper funciona correctamente

#### Script Guardian E2E
```bash
# Ubicación
/scripts/microservice-e2e-guardian.js

# Características
- Manejo automático del ciclo de vida del servicio
- Timeout configurable (15s para inicio, 30s para test)
- Logs detallados para debugging
- Limpieza automática al finalizar
```

## 🔍 Troubleshooting

### Problema: Puerto en uso
**Síntoma**: Error "EADDRINUSE: address already in use"
```bash
# Solución
npm run kill:ports
# o
node scripts/kill-ports.js
```

### Problema: Microservicio no responde
**Síntoma**: Timeout en requests
```bash
# Verificar logs
cd microservices/[nombre-servicio]
npm run logs

# Reiniciar servicio
npm run restart
```

### Problema: CORS bloqueado
**Síntoma**: Error de CORS en consola del navegador
```javascript
// Verificar configuración CORS en el microservicio
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Problema: Transcripción falla
**Síntoma**: Error en Susurro-Test
```bash
# Verificar modelo whisper
cd microservices/susurro-test
npm list nodejs-whisper

# Reinstalar si es necesario
npm install nodejs-whisper@latest
```

## 📊 Métricas y Monitoreo

### Logs Centralizados
Todos los microservicios escriben logs en:
- **Desarrollo**: Consola y archivos en `/tmp/`
- **Producción**: Sistema de logging centralizado (pendiente)

### Health Checks
Cada microservicio expone endpoint `/api/health` para monitoreo:
```bash
# Script de health check para todos los servicios
for port in 3000 3001 3002; do
  echo "Checking port $port..."
  curl -s http://localhost:$port/api/health | jq .
done
```

## 🔐 Seguridad

### Recomendaciones
1. **Autenticación**: Implementar tokens compartidos
2. **Rate Limiting**: Prevenir abuso de APIs
3. **Validación**: Sanitizar todas las entradas
4. **HTTPS**: Usar certificados en producción
5. **Secrets**: Nunca hardcodear credenciales

## 📝 Convenciones de Desarrollo

### Estructura de Directorios
```
microservices/
├── [nombre-servicio]/
│   ├── server.js
│   ├── config.js
│   ├── package.json
│   ├── README.md
│   └── src/
│       ├── routes/
│       ├── controllers/
│       └── utils/
```

### Nombrado
- **Servicios**: kebab-case (susurro-test)
- **Endpoints**: RESTful conventions
- **Variables**: camelCase
- **Constantes**: UPPER_SNAKE_CASE

---

**Última actualización**: 2025-07-12  
**Mantenido por**: Equipo de Desarrollo SYMFARMIA  
**Versión**: 1.0.0