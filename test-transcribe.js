const fs = require('fs');

async function transcribeSample() {
    console.log('🎯 Loading Xenova Transformers...');
    
    try {
        // Dynamic import for ES module
        const { pipeline, env } = await import('@xenova/transformers');
        
        // Configure environment
        env.allowLocalModels = false;
        env.allowRemoteModels = true;
        
        console.log('📥 Creating Whisper pipeline...');
        const transcriber = await pipeline(
            'automatic-speech-recognition',
            'Xenova/whisper-base',
            {
                progress_callback: (progress) => {
                    if (progress.status === 'progress') {
                        process.stdout.write(`\rDownloading: ${Math.round(progress.progress)}%`);
                    }
                }
            }
        );
        
        console.log('\n✅ Model loaded!');
        
        // Read the audio file
        const audioPath = '/workspaces/symfarmia/public/test-audio/sample.wav';
        console.log(`\n🎵 Reading audio file: ${audioPath}`);
        
        const audioBuffer = fs.readFileSync(audioPath);
        console.log(`📊 File size: ${(audioBuffer.length / 1024).toFixed(2)} KB`);
        
        console.log('\n🎤 Transcribing audio...');
        const startTime = Date.now();
        
        // Transcribe with Spanish language
        const result = await transcriber(audioBuffer, {
            language: 'spanish',
            task: 'transcribe',
            return_timestamps: true
        });
        
        const duration = (Date.now() - startTime) / 1000;
        
        console.log(`\n✅ Transcription completed in ${duration.toFixed(2)} seconds`);
        console.log('\n' + '='.repeat(50));
        console.log('📝 TRANSCRIPTION:');
        console.log('='.repeat(50));
        console.log(result.text || '(No transcription detected)');
        console.log('='.repeat(50));
        
        if (result.chunks && result.chunks.length > 0) {
            console.log('\n📊 Timestamps:');
            result.chunks.forEach((chunk, i) => {
                console.log(`  [${chunk.timestamp[0]}s - ${chunk.timestamp[1]}s]: ${chunk.text}`);
            });
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error.stack);
    }
}

// Run the transcription
transcribeSample().catch(console.error);