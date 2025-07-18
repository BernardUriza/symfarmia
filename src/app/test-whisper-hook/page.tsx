'use client';

import React, { useEffect, useState } from 'react';
import { useSimpleWhisperHybrid } from '@/src/domains/medical-ai/hooks/useSimpleWhisperHybrid';

export default function TestWhisperHook() {
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  
  const whisperHook = useSimpleWhisperHybrid({
    autoPreload: true,
    preferWorker: false, // Use main thread to avoid CDN issues
  });

  const {
    transcription,
    status,
    engineStatus,
    startTranscription,
    stopTranscription,
  } = whisperHook;

  useEffect(() => {
    // Log all status changes
    console.log('Engine Status:', engineStatus);
    console.log('Status:', status);
    console.log('Transcription:', transcription);
  }, [engineStatus, status, transcription]);

  const testWithSampleWav = async () => {
    try {
      setTestResult('Loading sample.wav...');
      
      // Instead of recording, we'll inject the sample.wav audio
      // First, let's modify the approach to play and record the sample
      const response = await fetch('/test-audio/sample.wav');
      const blob = await response.blob();
      
      // Create audio element to play the sample
      const audio = new Audio();
      audio.src = URL.createObjectURL(blob);
      
      setTestResult('Starting recording to capture playback...');
      
      // Start recording
      const started = await startTranscription();
      if (!started) {
        setTestResult('Failed to start transcription');
        return;
      }
      
      // Play the audio
      audio.play();
      
      // Stop after audio ends
      audio.onended = async () => {
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
        await stopTranscription();
        setTestResult('Processing complete. Check transcription below.');
      };
      
    } catch (error) {
      console.error('Test error:', error);
      setTestResult(`Error: ${error.message}`);
    }
  };

  // Alternative: Direct blob processing
  const testDirectBlob = async () => {
    try {
      setTestResult('Testing direct blob processing...');
      
      // Load sample.wav
      const response = await fetch('/test-audio/sample.wav');
      const arrayBuffer = await response.arrayBuffer();
      
      // Decode audio
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const audioData = audioBuffer.getChannelData(0);
      
      console.log('Audio loaded:', {
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        samples: audioData.length
      });
      
      // Now we need to process this with your hook
      // Since your hook expects MediaRecorder data, we'll simulate it
      setTestResult(`Audio loaded: ${audioBuffer.duration.toFixed(2)}s. Use "Test with Playback" to transcribe.`);
      
    } catch (error) {
      setTestResult(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Test useSimpleWhisperHybrid with sample.wav</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p>Engine Status: <strong>{engineStatus}</strong></p>
        <p>Recording Status: <strong>{status}</strong></p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testWithSampleWav}
          disabled={engineStatus !== 'ready'}
          style={{ marginRight: '10px', padding: '10px 20px' }}
        >
          Test with Playback
        </button>
        
        <button 
          onClick={testDirectBlob}
          style={{ padding: '10px 20px' }}
        >
          Load Audio Info
        </button>
      </div>
      
      {testResult && (
        <div style={{ 
          padding: '10px', 
          background: '#f0f0f0', 
          marginBottom: '20px',
          borderRadius: '5px' 
        }}>
          {testResult}
        </div>
      )}
      
      {transcription && (
        <div style={{ 
          padding: '20px', 
          background: '#e8f5e9', 
          borderRadius: '5px',
          marginTop: '20px' 
        }}>
          <h2>Transcription Result:</h2>
          <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
            "{transcription.text}"
          </p>
          <p>Confidence: {transcription.confidence}</p>
          <p>Medical Terms: {transcription.medicalTerms.join(', ') || 'None'}</p>
        </div>
      )}
    </div>
  );
}