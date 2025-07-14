'use client';
import { useState, useRef } from 'react';

export function useSimpleWhisper() {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('ready'); // ready, recording, processing
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.start();
      setIsRecording(true);
      setStatus('recording');
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;
    
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setStatus('processing');
    
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      console.log('Transcribing...');
      try {
        const { pipeline } = await import('@xenova/transformers');
        const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
        
        const audioContext = new AudioContext();
        const audioData = await audioContext.decodeAudioData(arrayBuffer);
        const float32Audio = audioData.getChannelData(0);
        
        const result = await transcriber(float32Audio);
        setTranscript(result.text || '');
        setStatus('ready');
        console.log('Transcript:', result.text);
      } catch (err) {
        console.error('Transcription error:', err);
        setStatus('ready');
      }
    };
  };

  return { transcript, isRecording, status, startRecording, stopRecording };
}