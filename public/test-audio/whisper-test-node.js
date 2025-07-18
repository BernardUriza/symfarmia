#!/usr/bin/env node

/**
 * Whisper Xenova Test Script
 * Prueba de transcripción usando Xenova/whisper-base en Node.js
 */

const fs = require('fs');
const path = require('path');

async function loadWhisperModel() {
    console.log('🔄 Cargando Transformers.js...');
    
    try {
        // Dynamic import for ES modules
        const { pipeline } = await import('@xenova/transformers');
        
        console.log('📦 Creando pipeline de Whisper...');
        const transcriber = await pipeline(
            'automatic-speech-recognition',
            'Xenova/whisper-base',
            {
                progress_callback: (progress) => {
                    if (progress.status === 'progress' && progress.progress) {
                        process.stdout.write(`\r📥 Descargando modelo: ${Math.round(progress.progress)}%`);
                    }
                }
            }
        );
        
        console.log('\n✅ Modelo cargado exitosamente');
        return transcriber;
    } catch (error) {
        console.error('❌ Error cargando modelo:', error.message);
        throw error;
    }
}

async function transcribeAudioFile(transcriber, audioPath) {
    console.log(`\n🎵 Procesando archivo: ${audioPath}`);
    
    try {
        // For Node.js, we need to handle audio differently
        // Xenova expects audio data, not file paths
        
        // Check if file exists
        if (!fs.existsSync(audioPath)) {
            throw new Error(`Archivo no encontrado: ${audioPath}`);
        }
        
        const stats = fs.statSync(audioPath);
        console.log(`📊 Tamaño del archivo: ${(stats.size / 1024).toFixed(2)} KB`);
        
        console.log('🎯 Iniciando transcripción...');
        const startTime = Date.now();
        
        // Read audio file
        const audioBuffer = fs.readFileSync(audioPath);
        
        // Transcribe with Spanish language
        const result = await transcriber(audioBuffer, {
            language: 'es',
            task: 'transcribe',
            chunk_length_s: 30,
            stride_length_s: 5
        });
        
        const duration = (Date.now() - startTime) / 1000;
        
        console.log(`\n✅ Transcripción completada en ${duration.toFixed(2)}s`);
        console.log('\n📝 Transcripción:');
        console.log('─'.repeat(50));
        console.log(result.text || '(Sin transcripción)');
        console.log('─'.repeat(50));
        
        return result;
    } catch (error) {
        console.error('❌ Error en transcripción:', error.message);
        throw error;
    }
}

async function generateTestAudio() {
    console.log('\n🎤 Generando audio de prueba...');
    
    // Create a simple test audio file using Node.js
    // This is a placeholder - in real scenario you'd use actual audio
    const testMessage = `
Para usar este script con un archivo WAV real:
1. Coloca tu archivo WAV en el directorio /public/test-audio/
2. Ejecuta: node whisper-test-node.js tu-archivo.wav

Alternativamente, abre whisper-test.html en el navegador para una interfaz visual.
    `;
    
    console.log(testMessage);
}

async function main() {
    console.log('🚀 Whisper Xenova Test - Node.js\n');
    
    const args = process.argv.slice(2);
    
    try {
        // Load model
        const transcriber = await loadWhisperModel();
        
        if (args.length > 0) {
            // Transcribe provided file
            const audioPath = path.resolve(args[0]);
            await transcribeAudioFile(transcriber, audioPath);
        } else {
            // Show instructions
            await generateTestAudio();
        }
        
    } catch (error) {
        console.error('\n💥 Error fatal:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { loadWhisperModel, transcribeAudioFile };