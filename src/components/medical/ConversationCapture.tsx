"use client"
import React, { useState } from "react";
import { useSimpleWhisper } from "../../../src/domains/medical-ai/hooks/useSimpleWhisper";
import { useRealAudioCapture } from "../../../src/domains/medical-ai/hooks/useRealAudioCapture";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { VoiceReactiveMicrophone } from "../ui/VoiceReactiveMicrophone";
import { Play, Square as Stop, RotateCcw, Copy } from "lucide-react";

export const ConversationCapture = ({
  onNext,
  onTranscriptionComplete,
  className = "",
}) => {
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const whisper = useSimpleWhisper();
  const realAudio = useRealAudioCapture();

  // Controla los 3 hooks a la vez
  const handleStart = async () => {
    const started = await whisper.startTranscription();
    realAudio.startRecording();
    if (!started && whisper.error?.includes("permiso"))
      setShowPermissionDialog(true);
  };

  const handleStop = async () => {
    await whisper.stopTranscription();
    realAudio.stopRecording();
    if (whisper.transcription?.text && onTranscriptionComplete)
      onTranscriptionComplete(whisper.transcription.text);
  };

  const handleReset = () => {
    whisper.resetTranscription();
    realAudio.clearTranscript?.();
  };

  const handleCopy = async () => {
    if (whisper.transcription?.text) {
      await navigator.clipboard.writeText(whisper.transcription.text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {showPermissionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h3 className="text-lg font-semibold mb-2">Permisos de Micrófono</h3>
            <p className="text-gray-600 mb-4">
              Para poder transcribir tu voz, necesitamos acceso al micrófono.
            </p>
            <Button onClick={() => setShowPermissionDialog(false)}>Cerrar</Button>
          </div>
        </div>
      )}

      <EngineStatus status={whisper.engineStatus} />

      <Card className="border-2 border-dashed border-blue-200 bg-white shadow-sm">
        <CardContent className="p-8 text-center">
          <VoiceReactiveMicrophone
            isRecording={whisper.isRecording}
            audioLevel={whisper.audioLevel}
            size="lg"
          />
          <Badge
            variant={whisper.isRecording ? "destructive" : "secondary"}
            className="text-sm px-3 py-1"
          >
            {whisper.isRecording ? "Grabando..." : "Listo para grabar"}
          </Badge>
          {whisper.isRecording && (
            <div className="my-2 text-3xl font-mono font-semibold text-blue-600">
              {formatTime(whisper.recordingTime)}
            </div>
          )}
          {/* Transcripción en tiempo real */}
          {whisper.isRecording &&  realAudio.transcript && (
            <div className="w-full max-w-md mt-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">En tiempo real:</p>
              <p className="text-sm text-gray-800">
                {realAudio.transcript}
              </p>
            </div>
          )}
          <div className="flex justify-center gap-4 mt-6">
            <Button
              size="lg"
              variant={whisper.isRecording ? "destructive" : "default"}
              onClick={whisper.isRecording ? handleStop : handleStart}
              disabled={whisper.status === "processing" || whisper.engineStatus === "loading"}
              className="px-8"
            >
              {whisper.isRecording ? (
                <>
                  <Stop className="w-5 h-5 mr-2" />
                  Detener
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Iniciar
                </>
              )}
            </Button>
            {whisper.transcription && (
              <>
                <Button variant="outline" size="md" onClick={handleReset}>
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reiniciar
                </Button>
                <Button variant="outline" size="md" onClick={handleCopy}>
                  <Copy className="w-5 h-5 mr-2" />
                  {copySuccess ? "Copiado!" : "Copiar"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {whisper.transcription && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Resultado de la transcripción:</h3>
            <div className="bg-gray-50 p-3 rounded text-sm mb-3">
              {whisper.transcription.text}
            </div>
            {whisper.audioUrl && (
              <div className="mb-3">
                <p className="text-sm font-medium mb-2">Audio grabado:</p>
                <audio controls className="w-full" src={whisper.audioUrl} />
              </div>
            )}
            <div className="flex gap-4 text-xs text-gray-600">
              <span>Confianza: {Math.round(whisper.transcription.confidence * 100)}%</span>
              <span>Proc.: {whisper.transcription.processingTime}ms</span>
              {whisper.transcription.medicalTerms.length > 0 && (
                <span>Térm. médicos: {whisper.transcription.medicalTerms.length}</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      {whisper.error && <ErrorAlert error={whisper.error} />}
      {whisper.status === "processing" && (
        <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-sm">Procesando audio con Whisper...</span>
          </div>
        </div>
      )}
      {onNext && whisper.transcription && (
        <div className="mt-6 flex justify-center">
          <Button onClick={onNext} size="lg" variant="default">
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConversationCapture;

const EngineStatus = ({ status }: { status: string }) => (
  <div className={`px-4 py-3 rounded ${
    status === "ready" ? "bg-green-50 border border-green-200 text-green-700" :
    status === "loading" ? "bg-yellow-50 border border-yellow-200 text-yellow-700" :
    "bg-red-50 border border-red-200 text-red-700"
  }`}>
    <span className="text-sm">
      Estado del motor: {
        status === "ready" ? "Listo ✅" :
        status === "loading" ? "Cargando modelo..." :
        status === "error" ? "Error ❌" :
        status === "fallback" ? "Modo alternativo" : status
      }
    </span>
  </div>
);

const ErrorAlert = ({ error }: { error: string }) => (
  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
    <div className="flex items-center">
      <div className="w-5 h-5 text-red-500 mr-2">⚠️</div>
      <span className="text-sm text-red-700">{error}</span>
    </div>
  </div>
);
