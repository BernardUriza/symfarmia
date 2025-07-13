require('dotenv').config();

const express = require('express');
const multer = require('multer');
const { nodewhisper } = require('nodejs-whisper');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Configure PATH for whisper-cli
if (process.env.WHISPER_CLI_PATH) {
  const whisperPath = path.resolve(process.env.WHISPER_CLI_PATH);
  process.env.PATH = `${whisperPath}:${process.env.PATH}`;
  console.log(`✅ Whisper CLI path configured: ${whisperPath}`);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Configuración de multer
const uploadsDir = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure uploads directory exists
    ensureDirectoryExists(uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    // Sanitize filename
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${sanitizedName}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de audio'), false);
    }
  }
});

// Crear directorios necesarios
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Directorio creado: ${dir}`);
  }
};

// Ensure directories exist on startup
ensureDirectoryExists(path.join(__dirname, 'uploads'));
ensureDirectoryExists(path.join(__dirname, 'test-audio'));

// ENDPOINT 1: Transcribir archivo existente en servidor
app.post('/api/transcribe-server-file', async (req, res) => {
  try {
    const { filename } = req.body;
    
    if (!filename) {
      return res.status(400).json({ 
        error: 'Se requiere el nombre del archivo',
        example: { "filename": "jfk.wav" }
      });
    }

    const audioPath = path.join(__dirname, 'test-audio', filename);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(audioPath)) {
      return res.status(404).json({ 
        error: 'Archivo no encontrado',
        path: audioPath,
        available_files: fs.readdirSync(path.join(__dirname, 'test-audio'))
      });
    }

    console.log(`[${new Date().toISOString()}] Procesando: ${audioPath}`);
    
    const startTime = Date.now();
    
    // USAR NODEJS-WHISPER (NO Hugging Face)
    const result = await nodewhisper(audioPath, {
      modelName: process.env.WHISPER_MODEL || 'medium',
      removeWavFileAfterTranscription: false,
      whisperOptions: {
        wordTimestamps: true,
        outputInJson: true,
        language: 'en'
      }
    });

    const processingTime = Date.now() - startTime;

    console.log(`[${new Date().toISOString()}] Resultado:`, result);

    // Extraer texto del resultado
    const transcriptText = result.text || result || '';

    res.json({
      success: true,
      filename: filename,
      transcript: transcriptText,
      raw_result: result,
      processing_time_ms: processingTime,
      audio_path: audioPath,
      model_used: `nodejs-whisper ${process.env.WHISPER_MODEL || 'medium'}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error en transcripción:`, error);
    res.status(500).json({
      error: 'Error al transcribir el archivo',
      details: error.message,
      filename: req.body.filename,
      timestamp: new Date().toISOString()
    });
  }
});

// ENDPOINT 2: Subir y transcribir archivo
app.post('/api/transcribe-upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No se subió ningún archivo de audio',
        help: 'Envíe un archivo de audio con el campo "audio" en multipart/form-data'
      });
    }

    const audioPath = path.resolve(req.file.path);
    console.log(`[${new Date().toISOString()}] Archivo subido:`);
    console.log(`  - Original: ${req.file.originalname}`);
    console.log(`  - Guardado: ${req.file.filename}`);
    console.log(`  - Ruta: ${audioPath}`);
    console.log(`  - Tamaño: ${req.file.size} bytes`);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(audioPath)) {
      throw new Error(`Archivo no encontrado después de guardar: ${audioPath}`);
    }
    
    const startTime = Date.now();
    
    console.log(`🎙️ Iniciando transcripción con nodejs-whisper...`);
    const result = await nodewhisper(audioPath, {
      modelName: process.env.WHISPER_MODEL || 'medium',
      removeWavFileAfterTranscription: false,
      whisperOptions: {
        wordTimestamps: true,
        outputInJson: true,
        language: req.body?.language || 'es' // Default to Spanish
      }
    });

    const processingTime = Date.now() - startTime;
    const transcriptText = result.text || result || '';

    console.log(`✅ Transcripción completada en ${processingTime}ms`);
    console.log(`📝 Texto: "${transcriptText.substring(0, 100)}..."`);

    // Opcional: Limpiar archivo después de procesar
    if (process.env.CLEANUP_AFTER_PROCESS === 'true') {
      setTimeout(() => {
        fs.unlink(audioPath, (err) => {
          if (err) console.log(`⚠️ No se pudo eliminar ${audioPath}:`, err.message);
          else console.log(`🗑️ Archivo temporal eliminado: ${req.file.filename}`);
        });
      }, 5000); // Esperar 5 segundos antes de eliminar
    }

    res.json({
      success: true,
      filename: req.file.filename,
      original_name: req.file.originalname,
      transcript: transcriptText,
      processing_time_ms: processingTime,
      file_size: req.file.size,
      model_used: `nodejs-whisper ${process.env.WHISPER_MODEL || 'medium'}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error detallado:`, error);
    res.status(500).json({
      error: 'Error al transcribir el archivo',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ENDPOINT 3: Listar archivos disponibles
app.get('/api/files', (req, res) => {
  try {
    const testAudioFiles = fs.readdirSync(path.join(__dirname, 'test-audio'));
    const uploadedFiles = fs.readdirSync(path.join(__dirname, 'uploads'));
    
    res.json({
      test_audio_files: testAudioFiles,
      uploaded_files: uploadedFiles,
      total_files: testAudioFiles.length + uploadedFiles.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ENDPOINT 4: Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'whisper-transcription-microservice',
    version: '1.0.0',
    library: 'nodejs-whisper',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/transcribe-server-file',
      'POST /api/transcribe-upload', 
      'GET /api/files',
      'GET /api/health'
    ]
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
${'='.repeat(60)}
🎙️  Whisper Transcription Microservice v1.0.0
🚀 Running at: http://localhost:${PORT}
📡 API Ready for Integration
${'='.repeat(60)}
📋 Available Endpoints:
   GET  /api/health                  - Service health check
   GET  /api/files                   - List available files
   POST /api/transcribe-upload       - Upload & transcribe
   POST /api/transcribe-server-file  - Transcribe server file
${'='.repeat(60)}
💡 Integration: curl -sSL https://your-repo/integrate-nextjs.sh | bash
${'='.repeat(60)}`);
});