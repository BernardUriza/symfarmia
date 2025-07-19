'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Mic, MicOff, Play, Pause, Download, Trash2 } from 'lucide-react';

export const SimpleAudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setDuration(0);
        setCurrentTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
      // Start timer
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setDuration((Date.now() - startTime) / 1000);
      }, 100);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('No se pudo acceder al micrófono. Por favor, verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioURL) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      setAudioURL(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  };

  const downloadRecording = () => {
    if (!audioURL) return;
    
    const a = document.createElement('a');
    a.href = audioURL;
    a.download = `grabacion-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.wav`;
    a.click();
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Grabador de Audio
          </h2>
          <p className="text-gray-600">
            Presiona el botón para grabar tu voz
          </p>
        </div>

        {/* Recording Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`
              relative w-32 h-32 rounded-full transition-all duration-300 transform
              ${isRecording 
                ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse' 
                : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
              }
              shadow-xl hover:shadow-2xl
            `}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {isRecording ? (
                <MicOff className="w-12 h-12 text-white" />
              ) : (
                <Mic className="w-12 h-12 text-white" />
              )}
            </div>
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-4 border-white opacity-75 animate-ping" />
            )}
          </button>
        </div>

        {/* Recording Timer */}
        {isRecording && (
          <div className="text-center mb-6">
            <p className="text-3xl font-mono text-red-500">
              {formatTime(duration)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Grabando...</p>
          </div>
        )}

        {/* Audio Player */}
        {audioURL && !isRecording && (
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg p-4">
              <audio
                ref={audioRef}
                src={audioURL}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-mono text-gray-600">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1 mx-4">
                  <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-mono text-gray-600">
                  {formatTime(duration)}
                </span>
              </div>

              <div className="flex justify-center gap-2">
                <Button
                  onClick={togglePlayback}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Reproducir
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={downloadRecording}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </Button>
                
                <Button
                  onClick={deleteRecording}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </Button>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500">
              Tu grabación está lista para reproducir
            </div>
          </div>
        )}

        {/* Instructions */}
        {!audioURL && !isRecording && (
          <div className="text-center text-gray-500">
            <p className="text-sm">
              Haz clic en el botón azul para comenzar a grabar
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleAudioRecorder;