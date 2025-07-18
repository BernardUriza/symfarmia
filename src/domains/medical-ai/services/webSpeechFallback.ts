// webSpeechFallback.ts - Fallback using Web Speech API
export class WebSpeechFallback {
  private recognition: any;
  private isSupported: boolean;

  constructor() {
    // Check if Web Speech API is available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.isSupported = !!SpeechRecognition;
    
    if (this.isSupported) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'es-ES';
      console.log('🎙️ [WebSpeech] Web Speech API initialized');
    } else {
      console.warn('⚠️ [WebSpeech] Web Speech API not supported');
    }
  }

  async transcribeFromBlob(audioBlob: Blob): Promise<{ text: string; confidence: number }> {
    console.log('🎯 [WebSpeech] Starting blob transcription fallback');
    
    if (!this.isSupported) {
      return {
        text: '[Web Speech API no disponible]',
        confidence: 0
      };
    }

    // For blob transcription, we need to play the audio and capture it
    // This is a simplified approach - in production you'd use MediaSource
    return new Promise((resolve) => {
      const audio = new Audio();
      const audioUrl = URL.createObjectURL(audioBlob);
      audio.src = audioUrl;
      
      let finalTranscript = '';
      
      this.recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + ' ';
            console.log('📝 [WebSpeech] Final transcript:', result[0].transcript);
          }
        }
      };
      
      this.recognition.onerror = (event: any) => {
        console.error('❌ [WebSpeech] Error:', event.error);
        resolve({
          text: `[Error de reconocimiento: ${event.error}]`,
          confidence: 0
        });
      };
      
      this.recognition.onend = () => {
        console.log('✅ [WebSpeech] Recognition ended');
        URL.revokeObjectURL(audioUrl);
        resolve({
          text: finalTranscript.trim() || '[No se detectó voz]',
          confidence: 0.7
        });
      };
      
      // Start recognition
      this.recognition.start();
      
      // Play audio (muted to avoid feedback)
      audio.volume = 0;
      audio.play().catch(err => {
        console.error('❌ [WebSpeech] Audio play error:', err);
        resolve({
          text: '[Error al reproducir audio]',
          confidence: 0
        });
      });
      
      // Stop after audio duration
      audio.onended = () => {
        setTimeout(() => {
          this.recognition.stop();
        }, 500);
      };
    });
  }

  startLiveTranscription(onResult: (text: string, isFinal: boolean) => void): void {
    if (!this.isSupported) {
      console.error('❌ [WebSpeech] API not supported');
      return;
    }

    console.log('🎯 [WebSpeech] Setting up live transcription...');
    console.log('🔧 [WebSpeech] Recognition object:', this.recognition);
    console.log('🔧 [WebSpeech] Recognition settings:', {
      continuous: this.recognition.continuous,
      interimResults: this.recognition.interimResults,
      lang: this.recognition.lang
    });

    // Clear any previous handlers
    this.recognition.onresult = null;
    this.recognition.onerror = null;
    this.recognition.onend = null;
    this.recognition.onstart = null;
    this.recognition.onspeechstart = null;
    this.recognition.onspeechend = null;
    this.recognition.onaudiostart = null;
    this.recognition.onaudioend = null;
    this.recognition.onnomatch = null;

    this.recognition.onstart = () => {
      console.log('🟢 [WebSpeech] Recognition started successfully');
    };

    this.recognition.onaudiostart = () => {
      console.log('🎤 [WebSpeech] Audio capture started');
    };

    this.recognition.onspeechstart = () => {
      console.log('🗣️ [WebSpeech] Speech detected');
    };

    this.recognition.onresult = (event: any) => {
      console.log('📝 [WebSpeech] Got result event:', event.results.length, 'results');
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const isFinal = result.isFinal;
        console.log(`💬 [WebSpeech] ${isFinal ? 'Final' : 'Interim'} transcript:`, transcript);
        onResult(transcript, isFinal);
      }
    };

    this.recognition.onnomatch = () => {
      console.log('❓ [WebSpeech] No speech match found');
    };

    this.recognition.onspeechend = () => {
      console.log('🔇 [WebSpeech] Speech ended');
    };

    this.recognition.onaudioend = () => {
      console.log('🔕 [WebSpeech] Audio capture ended');
    };

    this.recognition.onerror = (event: any) => {
      console.error('❌ [WebSpeech] Recognition error:', event.error, event);
      // Common errors: 'no-speech', 'audio-capture', 'not-allowed'
      if (event.error === 'not-allowed') {
        console.error('🚫 [WebSpeech] Microphone permission denied');
        onResult('[Error: Permiso de micrófono denegado]', true);
      } else if (event.error === 'no-speech') {
        console.log('🤐 [WebSpeech] No speech detected');
      } else if (event.error === 'audio-capture') {
        console.error('🎙️ [WebSpeech] Audio capture failed');
        onResult('[Error: Fallo en captura de audio]', true);
      }
    };

    this.recognition.onend = () => {
      console.log('🔵 [WebSpeech] Recognition ended');
      // Restart if it was not stopped manually
      if (this.isSupported) {
        console.log('🔄 [WebSpeech] Restarting recognition...');
        try {
          this.recognition.start();
        } catch (e) {
          console.log('⚠️ [WebSpeech] Could not restart:', e);
        }
      }
    };

    try {
      this.recognition.start();
      console.log('🔴 [WebSpeech] Called start() on recognition');
    } catch (error) {
      console.error('💥 [WebSpeech] Failed to start recognition:', error);
      onResult('[Error: No se pudo iniciar el reconocimiento]', true);
    }
  }

  stop(): void {
    if (this.recognition && this.isSupported) {
      this.recognition.stop();
      console.log('⏹️ [WebSpeech] Transcription stopped');
    }
  }
}

// Singleton instance
export const webSpeechFallback = new WebSpeechFallback();