/**
 * Example usage of WhisperWASMEngine
 * 
 * Demonstrates how to use the real Whisper.cpp WASM engine for medical transcription
 */

import { WhisperWASMEngine } from '../services/WhisperWASMEngine.js';
import { AudioProcessor } from '../services/AudioProcessor.js';
import { TranscriptionStatus } from '../types';

/**
 * Basic usage example
 */
export async function basicUsageExample() {
  console.log('🚀 Starting Whisper WASM Basic Usage Example...');
  
  try {
    // Initialize the engine
    const engine = new WhisperWASMEngine({
      modelName: 'base',
      language: 'es',
      medicalMode: true
    });
    
    // Initialize
    await engine.initialize();
    console.log('✅ Engine initialized successfully');
    
    // Check if ready
    const isReady = await engine.isReady();
    console.log('🔍 Engine ready:', isReady);
    
    // Start transcription
    const result = await engine.startTranscription({}, {
      onStart: (data) => {
        console.log('🎙️ Recording started:', data);
      },
      onTranscriptionUpdate: (data) => {
        console.log('📝 Transcription update:', data.text);
        console.log('📊 Confidence:', data.confidence);
      },
      onComplete: (data) => {
        console.log('✅ Transcription completed:', data);
      },
      onError: (error) => {
        console.error('❌ Transcription error:', error);
      }
    });
    
    console.log('🎯 Transcription session started:', result);
    
    // Simulate stopping after 10 seconds
    setTimeout(async () => {
      try {
        const finalResult = await engine.stopTranscription();
        console.log('🏁 Final transcription result:', finalResult);
        
        // Cleanup
        await engine.cleanup();
        console.log('🧹 Cleanup completed');
      } catch (error) {
        console.error('❌ Error stopping transcription:', error);
      }
    }, 10000);
    
  } catch (error) {
    console.error('❌ Basic usage example failed:', error);
  }
}

/**
 * Advanced usage example with custom configuration
 */
export async function advancedUsageExample() {
  console.log('🚀 Starting Whisper WASM Advanced Usage Example...');
  
  try {
    // Initialize with custom configuration
    const engine = new WhisperWASMEngine({
      modelName: 'whisper-small',
      language: 'es',
      sampleRate: 16000,
      chunkSize: 2048,
      n_threads: 4,
      translate: false,
      no_context: false,
      single_segment: false,
      print_timestamps: true,
      medicalMode: true,
      wasmPath: '/whisper.wasm',
      modelPath: '/models/whisper-small.bin'
    });
    
    // Set medical context
    engine.setMedicalContext({
      specialty: 'cardiology',
      keywords: ['arritmia', 'taquicardia', 'bradicardia', 'fibrilación'],
      patient: {
        age: 65,
        gender: 'male',
        conditions: ['hipertensión', 'diabetes']
      }
    });
    
    // Initialize
    await engine.initialize();
    console.log('✅ Advanced engine initialized');
    
    // Get engine stats
    const stats = engine.getEngineStats();
    console.log('📊 Engine stats:', stats);
    
    // Start transcription with detailed callbacks
    await engine.startTranscription({
      continuousMode: true,
      realTimeProcessing: true
    }, {
      onStart: (data) => {
        console.log('🎙️ Advanced recording started:', data);
      },
      onTranscriptionUpdate: (data) => {
        console.log('📝 Advanced update:', {
          text: data.text,
          fullText: data.fullText,
          confidence: data.confidence,
          segments: data.segments?.length || 0
        });
        
        // Process medical terms
        if (data.segments) {
          const medicalTerms = data.segments
            .filter(s => s.text.includes('cardio') || s.text.includes('corazón'))
            .map(s => s.text);
          
          if (medicalTerms.length > 0) {
            console.log('🏥 Medical terms detected:', medicalTerms);
          }
        }
      },
      onComplete: (data) => {
        console.log('✅ Advanced transcription completed:', {
          duration: data.duration,
          totalSegments: data.segments?.length || 0,
          totalWords: data.fullText?.split(' ').length || 0,
          language: data.language
        });
        
        // Save transcription
        saveTranscription(data);
      },
      onError: (error) => {
        console.error('❌ Advanced error:', error);
        
        if (error.recoverable) {
          console.log('🔄 Attempting recovery...');
        } else {
          console.log('💥 Fatal error, stopping transcription');
        }
      }
    });
    
    // Simulate stopping after 30 seconds
    setTimeout(async () => {
      try {
        await engine.stopTranscription();
        await engine.cleanup();
        console.log('🧹 Advanced cleanup completed');
      } catch (error) {
        console.error('❌ Advanced cleanup error:', error);
      }
    }, 30000);
    
  } catch (error) {
    console.error('❌ Advanced usage example failed:', error);
  }
}

/**
 * Direct model loading example
 */
export async function directModelLoadingExample() {
  console.log('🚀 Starting Direct Model Loading Example...');
  
  try {
    // Initialize engine with direct model path
    const engine = new WhisperWASMEngine({
      modelName: 'base',
      language: 'es',
      medicalMode: true
    });
    
    // The engine will automatically load the model from /models/ggml-base.bin
    await engine.initialize();
    console.log('✅ Engine initialized with model loaded from public folder');
    
    // Available models in public folder:
    const availableModels = [
      { name: 'base', path: '/models/ggml-base.bin', size: '148MB' },
      { name: 'base.en', path: '/models/ggml-base.en.bin', size: '148MB' }
    ];
    console.log('📋 Available models:', availableModels);
    
    // The models are cached automatically by the browser and whisperUtils
    console.log('💾 Models are automatically cached in browser storage');
    
    // Check if ready
    const isReady = await engine.isReady();
    console.log('🔍 Engine ready:', isReady);
    
    // Cleanup
    await engine.cleanup();
    console.log('🧹 Engine cleanup completed');
    
  } catch (error) {
    console.error('❌ Direct model loading example failed:', error);
  }
}

/**
 * Audio processing example
 */
export async function audioProcessingExample() {
  console.log('🚀 Starting Audio Processing Example...');
  
  try {
    // Initialize audio processor
    const audioProcessor = new AudioProcessor({
      sampleRate: 16000,
      channels: 1,
      bufferSize: 4096,
      maxDuration: 30
    });
    
    await audioProcessor.initialize();
    console.log('✅ Audio processor initialized');
    
    // Get user media
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    
    console.log('🎙️ Microphone access granted');
    
    // Start processing
    await audioProcessor.startProcessing(mediaStream, {
      onStart: () => {
        console.log('🎵 Audio processing started');
      },
      onAudioData: (audioData) => {
        console.log('🔊 Audio data received:', audioData.length, 'samples');
        
        // Calculate RMS level
        const rms = audioProcessor.calculateRMS(audioData);
        console.log('📊 Audio level (RMS):', rms.toFixed(4));
        
        // Process with Whisper here...
      },
      onStop: () => {
        console.log('🔇 Audio processing stopped');
      },
      onError: (error) => {
        console.error('❌ Audio processing error:', error);
      }
    });
    
    // Stop after 15 seconds
    setTimeout(async () => {
      try {
        await audioProcessor.stopProcessing();
        await audioProcessor.cleanup();
        console.log('🧹 Audio processor cleanup completed');
      } catch (error) {
        console.error('❌ Audio processing cleanup error:', error);
      }
    }, 15000);
    
  } catch (error) {
    console.error('❌ Audio processing example failed:', error);
  }
}

/**
 * Complete medical transcription workflow
 */
export async function medicalTranscriptionWorkflow() {
  console.log('🚀 Starting Complete Medical Transcription Workflow...');
  
  try {
    // Initialize all components
    const audioProcessor = new AudioProcessor();
    const engine = new WhisperWASMEngine({
      modelName: 'base',
      language: 'es',
      medicalMode: true
    });
    
    // Initialize everything
    await Promise.all([
      audioProcessor.initialize(),
      engine.initialize()
    ]);
    
    console.log('✅ All components initialized');
    
    // Set medical context
    engine.setMedicalContext({
      specialty: 'general_medicine',
      session: 'consultation',
      patient: {
        id: 'patient_123',
        age: 45,
        gender: 'female'
      }
    });
    
    // Start the workflow
    const transcriptionPromise = engine.startTranscription({}, {
      onStart: (data) => {
        console.log('🏥 Medical transcription started:', data.sessionId);
      },
      onTranscriptionUpdate: (data) => {
        console.log('📋 Medical transcript:', data.text);
        
        // Extract medical information
        const medicalInfo = extractMedicalInfo(data.text);
        if (medicalInfo.symptoms.length > 0) {
          console.log('🩺 Symptoms detected:', medicalInfo.symptoms);
        }
        if (medicalInfo.medications.length > 0) {
          console.log('💊 Medications mentioned:', medicalInfo.medications);
        }
      },
      onComplete: (data) => {
        console.log('✅ Medical transcription completed');
        
        // Generate medical report
        const report = generateMedicalReport(data);
        console.log('📄 Medical report generated:', report);
        
        // Save to database (simulated)
        saveMedicalRecord(report);
      },
      onError: (error) => {
        console.error('❌ Medical transcription error:', error);
      }
    });
    
    // Simulate consultation duration
    setTimeout(async () => {
      try {
        await engine.stopTranscription();
        await Promise.all([
          engine.cleanup(),
          audioProcessor.cleanup()
        ]);
        console.log('🧹 Complete workflow cleanup completed');
      } catch (error) {
        console.error('❌ Workflow cleanup error:', error);
      }
    }, 45000); // 45 seconds
    
  } catch (error) {
    console.error('❌ Medical transcription workflow failed:', error);
  }
}

/**
 * Helper function to extract medical information
 */
function extractMedicalInfo(text) {
  const symptoms = [];
  const medications = [];
  
  // Simple keyword extraction (in real app, use medical NLP)
  const symptomKeywords = ['dolor', 'fiebre', 'tos', 'náusea', 'mareo', 'fatiga'];
  const medicationKeywords = ['aspirina', 'ibuprofeno', 'paracetamol', 'antibiótico'];
  
  const lowerText = text.toLowerCase();
  
  symptomKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      symptoms.push(keyword);
    }
  });
  
  medicationKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      medications.push(keyword);
    }
  });
  
  return { symptoms, medications };
}

/**
 * Helper function to generate medical report
 */
function generateMedicalReport(transcriptionData) {
  return {
    id: `report_${Date.now()}`,
    sessionId: transcriptionData.sessionId,
    timestamp: new Date().toISOString(),
    duration: transcriptionData.duration,
    language: transcriptionData.language,
    transcription: {
      fullText: transcriptionData.fullText,
      segments: transcriptionData.segments,
      confidence: transcriptionData.confidence || 0.9
    },
    medicalInfo: extractMedicalInfo(transcriptionData.fullText),
    status: 'completed',
    engine: 'whisper-wasm'
  };
}

/**
 * Helper function to save transcription
 */
function saveTranscription(data) {
  // In real app, save to database
  console.log('💾 Saving transcription to database...');
  localStorage.setItem(`transcription_${data.sessionId}`, JSON.stringify(data));
  console.log('✅ Transcription saved locally');
}

/**
 * Helper function to save medical record
 */
function saveMedicalRecord(report) {
  // In real app, save to secure medical database
  console.log('🏥 Saving medical record to secure database...');
  localStorage.setItem(`medical_record_${report.id}`, JSON.stringify(report));
  console.log('✅ Medical record saved locally');
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('🚀 Running All Whisper WASM Examples...\n');
  
  const examples = [
    { name: 'Basic Usage', fn: basicUsageExample },
    { name: 'Advanced Usage', fn: advancedUsageExample },
    { name: 'Model Management', fn: modelManagementExample },
    { name: 'Audio Processing', fn: audioProcessingExample },
    { name: 'Medical Workflow', fn: medicalTranscriptionWorkflow }
  ];
  
  for (const example of examples) {
    try {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`Running: ${example.name}`);
      console.log(`${'='.repeat(50)}`);
      
      await example.fn();
      
      console.log(`✅ ${example.name} completed successfully`);
      
      // Wait between examples
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ ${example.name} failed:`, error);
    }
  }
  
  console.log('\n🎉 All examples completed!');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.WhisperWASMExamples = {
    basicUsageExample,
    advancedUsageExample,
    modelManagementExample,
    audioProcessingExample,
    medicalTranscriptionWorkflow,
    runAllExamples
  };
  
  console.log('🎯 Whisper WASM examples loaded. Run window.WhisperWASMExamples.runAllExamples() to start.');
}