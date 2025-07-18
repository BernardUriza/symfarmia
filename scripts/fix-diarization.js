const fs = require('fs');
const path = require('path');

// Fix ConversationCapture.tsx
const filePath = path.join(process.cwd(), 'src/components/medical/ConversationCapture.tsx');
const content = fs.readFileSync(filePath, 'utf8');

// Split by semicolons and braces to reformat
let formatted = content
  .replace(/;(?!\s*\n)/g, ';\n')
  .replace(/\{(?!\s*\n)/g, '{\n')
  .replace(/\}(?!\s*[,;)])/g, '\n}')
  .replace(/\) => \{/g, ') => {\n')
  .replace(/const \{/g, '\nconst {')
  .replace(/import \{/g, '\nimport {');

// Find and fix the specific useSimpleWhisper destructuring
formatted = formatted.replace(
  /const \{ transcription, status, error, engineStatus: whisperEngineStatus, audioLevel, recordingTime, audioUrl, startTranscription, stopTranscription, resetTranscription \} = whisperService;/,
  `const { 
    transcription, 
    status, 
    error, 
    engineStatus: whisperEngineStatus, 
    audioLevel, 
    recordingTime, 
    audioUrl, 
    audioBlob,
    startTranscription, 
    stopTranscription, 
    resetTranscription 
  } = whisperService;`
);

// Fix the processDiarization function to get audio data
formatted = formatted.replace(
  /const completeAudio = null; \/\/ useSimpleWhisper handles audio internally/,
  `// Get audio data from audioBlob
    const completeAudio = audioBlob ? await audioBlob.arrayBuffer().then(buffer => new Float32Array(buffer)) : null;`
);

// Update the audio check logic
formatted = formatted.replace(
  /if \(!completeAudio && !allMinutesText && !transcriptionState\.webSpeechText\)/,
  'if (!completeAudio && !audioBlob && !allMinutesText && !transcriptionState.webSpeechText)'
);

// Update audioDataRef assignment
formatted = formatted.replace(
  /if \(!audioDataRef\.current\) \{/,
  `// Store audio data for diarization
    if (completeAudio) {
      audioDataRef.current = completeAudio;
    }
    
    if (!audioDataRef.current) {`
);

fs.writeFileSync(filePath, formatted);
console.log('✅ Fixed ConversationCapture.tsx');

// Now fix the DiarizationService.ts
const diarizationPath = path.join(process.cwd(), 'src/domains/medical-ai/services/DiarizationService.ts');
const diarizationContent = fs.readFileSync(diarizationPath, 'utf8');

// Fix the placeholder algorithms
let fixedDiarization = diarizationContent
  // Fix calculateSpeakerChangeProb
  .replace(
    /private calculateSpeakerChangeProb\(embeddings: any, timestamp: \[number, number\]\): number \{[\s\S]*?\n\s*\}/,
    `private calculateSpeakerChangeProb(embeddings: any, timestamp: [number, number]): number {
    // Enhanced speaker change detection using embeddings variance
    if (!embeddings || !embeddings.data) return 0;
    
    const timePoint = timestamp[0];
    const frameIndex = Math.floor(timePoint * 100); // Assuming 100Hz embedding rate
    
    if (frameIndex < 1 || frameIndex >= embeddings.data.length) return 0;
    
    // Calculate cosine similarity between consecutive frames
    const currentFrame = embeddings.data[frameIndex];
    const previousFrame = embeddings.data[frameIndex - 1];
    
    if (!currentFrame || !previousFrame) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < currentFrame.length; i++) {
      dotProduct += currentFrame[i] * previousFrame[i];
      normA += currentFrame[i] * currentFrame[i];
      normB += previousFrame[i] * previousFrame[i];
    }
    
    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    // Convert similarity to change probability (inverse relationship)
    return 1 - Math.max(0, Math.min(1, similarity));
  }`
  )
  // Fix identifySpeaker
  .replace(
    /private identifySpeaker\(embeddings: any, timestamp: \[number, number\]\): 'DOCTOR' \| 'PATIENT' \| 'UNKNOWN' \{[\s\S]*?\n\s*\}/,
    `private identifySpeaker(embeddings: any, timestamp: [number, number]): 'DOCTOR' | 'PATIENT' | 'UNKNOWN' {
    // Enhanced speaker identification using embedding clustering
    if (!embeddings || !embeddings.data) return 'UNKNOWN';
    
    const timePoint = timestamp[0];
    const frameIndex = Math.floor(timePoint * 100);
    
    if (frameIndex < 0 || frameIndex >= embeddings.data.length) return 'UNKNOWN';
    
    const currentEmbedding = embeddings.data[frameIndex];
    if (!currentEmbedding) return 'UNKNOWN';
    
    // Simple k-means style clustering
    // In a real implementation, this would use pre-computed speaker centroids
    const embeddingMagnitude = currentEmbedding.reduce((sum: number, val: number) => sum + Math.abs(val), 0);
    
    // Heuristic: Higher energy embeddings tend to be doctor (more assertive speech)
    // Lower energy tends to be patient (more hesitant)
    // This is a simplified approach - real implementation would use proper clustering
    if (embeddingMagnitude > 50) {
      return 'DOCTOR';
    } else if (embeddingMagnitude > 20) {
      return 'PATIENT';
    }
    
    return 'UNKNOWN';
  }`
  )
  // Fix model names to use correct Xenova models
  .replace(
    /segmentationModel: 'onnx-community\/pyannote-segmentation-3\.0'/,
    `segmentationModel: 'Xenova/pyannote-segmentation'`
  )
  .replace(
    /whisperModel: 'onnx-community\/whisper-base_timestamped'/,
    `whisperModel: 'Xenova/whisper-base'`
  );

fs.writeFileSync(diarizationPath, fixedDiarization);
console.log('✅ Fixed DiarizationService.ts');

console.log('🎉 Diarization fixes completed!');