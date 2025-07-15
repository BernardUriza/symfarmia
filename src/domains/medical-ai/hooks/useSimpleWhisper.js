"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  loadWhisperModel,
  transcribeAudio,
} from "../services/audioProcessingService";
import { extractMedicalTermsFromText } from "../utils/medicalTerms";

export function useSimpleWhisper({
  autoPreload = true,
  retryCount = 3,
  retryDelay = 1000,
} = {}) {
  // ... (mismos estados y referencias que tu versión original)
  const [transcription, setTranscription] = useState(null);
  const [status, setStatus] = useState("idle");
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [engineStatus, setEngineStatus] = useState("loading");
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const animationFrameRef = useRef(null);

  const preloadModel = useCallback(async () => {
    try {
      setEngineStatus("loading");
      await loadWhisperModel({
        retryCount,
        retryDelay,
        onProgress: (p) => setLoadProgress(p?.progress || 0),
      });
      setEngineStatus("ready");
    } catch (err) {
      setEngineStatus("error");
      setError("Error cargando el modelo de transcripción");
    }
  }, [retryCount, retryDelay]);

  useEffect(() => {
    if (autoPreload) preloadModel();
  }, [autoPreload, preloadModel]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      )
        mediaRecorderRef.current.stop();
      if (streamRef.current)
        streamRef.current.getTracks().forEach((track) => track.stop());
      if (audioContextRef.current && audioContextRef.current.state !== "closed")
        audioContextRef.current.close();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const setupAudioMonitoring = useCallback((stream) => {
    console.log(
      "🎤 [AudioMonitoring] Iniciando configuración de monitoreo de audio"
    );

    const audioContext = new AudioContext();
    console.log("🎧 [AudioMonitoring] AudioContext creado:", audioContext);

    const analyser = audioContext.createAnalyser();
    console.log("🧪 [AudioMonitoring] AnalyserNode creado:", analyser);

    const source = audioContext.createMediaStreamSource(stream);
    console.log(
      "🔗 [AudioMonitoring] MediaStreamSource creado y conectado:",
      source
    );

    analyser.fftSize = 256;
    console.log("⚙️ [AudioMonitoring] fftSize configurado:", analyser.fftSize);

    source.connect(analyser);
    console.log("🔌 [AudioMonitoring] Fuente conectada al analyser.");

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    console.log(
      "📊 [AudioMonitoring] dataArray inicializado, tamaño:",
      dataArray.length
    );

    const updateLevel = () => {
      if (
        !mediaRecorderRef.current ||
        mediaRecorderRef.current.state !== "recording"
      ) {
        console.log(
          "⛔ [AudioMonitoring] MediaRecorder no está grabando. AudioLevel a 0."
        );
        setAudioLevel(0);
        return;
      }

      analyser.getByteFrequencyData(dataArray);

      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

      const level = Math.round(average);
      setAudioLevel(level);
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    console.log("🚀 [AudioMonitoring] Iniciando loop de monitoreo de audio");
    updateLevel();
  }, []);

  useEffect(() => {
    if (isRecording) {
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);
  function resampleTo16kHz(input, originalSampleRate) {
    if (originalSampleRate === 16000) return input;
    const ratio = originalSampleRate / 16000;
    const newLength = Math.round(input.length / ratio);
    const result = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
      result[i] = input[Math.floor(i * ratio)] || 0;
    }
    return result;
  }

  const startTranscription = async () => {
    try {
      setError(null);
      setStatus("recording");
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      setupAudioMonitoring(stream);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        await processAudio();
      };
      mediaRecorder.start();

      const waitForRecording = () => {
        console.log("⏳ Esperando MediaRecorder...");
        if (mediaRecorder.state === "recording") {
          console.log(
            "✅ MediaRecorder ahora SÍ está grabando. Iniciando monitoreo."
          );
          setupAudioMonitoring(stream);
        } else {
          setTimeout(waitForRecording, 50);
        }
      };
      waitForRecording();
      setIsRecording(true);
      return true;
    } catch (err) {
      setError("Error al iniciar la grabación: " + err.message);
      setStatus("error");
      setEngineStatus("error");
      return false;
    }
  };

  const stopTranscription = async () => {
    if (mediaRecorderRef.current && isRecording) {
      setIsRecording(false);
      mediaRecorderRef.current.stop();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      return true;
    }
    return false;
  };

  const processAudio = async () => {
    console.log("🧪 [processAudio] Iniciando procesamiento de audio");
    setStatus("processing");
    try {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      console.log("💾 [processAudio] Blob creado:", audioBlob);

      setAudioBlob(audioBlob);

      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      console.log("🔗 [processAudio] URL de audio creada:", url);

      const arrayBuffer = await audioBlob.arrayBuffer();
      console.log(
        "📦 [processAudio] ArrayBuffer obtenido. Bytes:",
        arrayBuffer.byteLength
      );

      const audioContext = new AudioContext();
      console.log("🎧 [processAudio] AudioContext creado:", audioContext);

      const audioData = await audioContext.decodeAudioData(arrayBuffer);
      console.log("🔬 [processAudio] Audio decodificado:", audioData);

      const float32Audio = audioData.getChannelData(0);
      console.log(
        "📈 [processAudio] Canal 0 extraído. Samples:",
        float32Audio.length
      );

      if (!float32Audio || float32Audio.length === 0)
        throw new Error("No se obtuvo audio válido");

      console.log("⏳ [processAudio] Pre-cargando modelo...");
      await preloadModel();
      console.log("✅ [processAudio] Modelo cargado.");

      const start = performance.now();
      console.log("🤖 [processAudio] Transcribiendo audio...");
      const resampledAudio = resampleTo16kHz(
        float32Audio,
        audioData.sampleRate
      );
      console.log(
        "🔁 [processAudio] Audio resampleado a 16kHz. Samples:",
        resampledAudio.length
      );

      const result = await transcribeAudio(resampledAudio, {
        chunk_length_s: 30,
        return_timestamps: false,
      });

      const end = performance.now();
      const duration = Math.round(end - start);
      console.log(
        "📝 [processAudio] Transcripción completada en",
        duration,
        "ms:",
        result
      );

      const medicalTerms = extractMedicalTermsFromText(result.text || "");
      console.log(
        "🏥 [processAudio] Términos médicos extraídos:",
        medicalTerms
      );

      setTranscription({
        text: result.text || "",
        confidence: 0.95,
        medicalTerms,
        processingTime: duration,
      });
      setStatus("completed");
      console.log("🎉 [processAudio] Estado: COMPLETED");
    } catch (err) {
      console.error("🔥 [processAudio] ERROR:", err);
      setError("Error al procesar el audio: " + err.message);
      setStatus("error");
      setEngineStatus("error");
    }
  };

  const resetTranscription = () => {
    setTranscription(null);
    setStatus("idle");
    setError(null);
    setRecordingTime(0);
    setAudioLevel(0);
    audioChunksRef.current = [];
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setAudioBlob(null);
  };

  return {
    transcription,
    status,
    isRecording,
    error,
    engineStatus,
    loadProgress,
    audioLevel,
    recordingTime,
    audioUrl,
    audioBlob,
    startTranscription,
    stopTranscription,
    resetTranscription,
    preloadModel,
  };
}
