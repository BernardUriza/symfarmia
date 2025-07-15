"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { loadWhisperModel, transcribeAudio } from "../services/audioProcessingService";
import { extractMedicalTermsFromText } from "../utils/medicalTerms";
import { resampleTo16kHz, normalizeFloat32 } from "../utils/audioHelpers";
import { DefaultLogger } from "../utils/LoggerStrategy";

export function useSimpleWhisper({
  autoPreload = true,
  retryCount = 3,
  retryDelay = 1000,
  logger = DefaultLogger,
} = {}) {
  // Estados y refs
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

  // Logger strategy pattern
  const log = (...args) => logger.log(...args);
  const errorLog = (...args) => logger.error(...args);

  // PRELOAD MODEL
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
      errorLog("🛑 [preloadModel] ERROR:", err);
    }
  }, [retryCount, retryDelay, logger]);

  useEffect(() => {
    if (autoPreload) preloadModel();
  }, [autoPreload, preloadModel]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording")
        mediaRecorderRef.current.stop();
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
      if (audioContextRef.current && audioContextRef.current.state !== "closed")
        audioContextRef.current.close();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // AUDIO MONITORING
  const setupAudioMonitoring = useCallback((stream) => {
    log("🎤 [AudioMonitoring] Setup audio monitor");
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    analyser.fftSize = 256;
    source.connect(analyser);
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording") {
        log("⛔ [AudioMonitoring] Not recording. AudioLevel 0.");
        setAudioLevel(0);
        return;
      }
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAudioLevel(Math.round(average));
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };
    updateLevel();
  }, [logger]);

  // TIMER
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

  // TRANSCRIPTION
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

      // Wait for recording state
      const waitForRecording = () => {
        log("⏳ Esperando MediaRecorder...");
        if (mediaRecorder.state === "recording") {
          log("✅ MediaRecorder grabando. Monitoreo iniciado.");
          setupAudioMonitoring(stream);
        } else {
          setTimeout(waitForRecording, 50);
        }
      };
      waitForRecording();
      setIsRecording(true);
      return true;
    } catch (err) {
      errorLog("🛑 [startTranscription] ERROR:", err);
      setError("Error al iniciar la grabación: " + err.message);
      setStatus("error");
      setEngineStatus("error");
      return false;
    }
  };

  // STOP TRANSCRIPTION
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

  // PROCESS AUDIO
  const processAudio = async () => {
    log("🧪 [processAudio] Procesando audio...");
    setStatus("processing");
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      setAudioBlob(audioBlob);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new AudioContext();
      const audioData = await audioContext.decodeAudioData(arrayBuffer);
      const float32Audio = audioData.getChannelData(0);
      if (!float32Audio || float32Audio.length === 0)
        throw new Error("No se obtuvo audio válido");

      await preloadModel();

      // RESAMPLE + NORMALIZE
      const resampledAudio = resampleTo16kHz(float32Audio, audioData.sampleRate);
      const normalizedAudio = normalizeFloat32(resampledAudio);
      log("🔁 [processAudio] Audio resampleado y normalizado. Samples:", normalizedAudio.length);

      const start = performance.now();
      const result = await transcribeAudio(normalizedAudio, {
        chunk_length_s: 30,
        return_timestamps: false,
      });
      const end = performance.now();
      const duration = Math.round(end - start);

      log("📝 [processAudio] Transcripción completada en", duration, "ms:", result);

      const medicalTerms = extractMedicalTermsFromText(result.text || "");
      log("🏥 [processAudio] Términos médicos extraídos:", medicalTerms);

      setTranscription({
        text: result.text || "",
        confidence: 0.95,
        medicalTerms,
        processingTime: duration,
      });
      setStatus("completed");
      log("🎉 [processAudio] Estado: COMPLETED");
    } catch (err) {
      errorLog("🔥 [processAudio] ERROR:", err);
      setError("Error al procesar el audio: " + err.message);
      setStatus("error");
      setEngineStatus("error");
    }
  };

  // RESET
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

  // API
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
    setLogger: logger.setEnabled ? logger.setEnabled.bind(logger) : undefined,
  };
}
