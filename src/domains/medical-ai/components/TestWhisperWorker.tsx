"use client";
import { useSimpleWhisper } from '../hooks/useSimpleWhisper';

export function TestWhisperWorker() {
  const {
    transcription,
    status,
    isRecording,
    error,
    engineStatus,
    loadProgress,
    audioLevel,
    recordingTime,
    startTranscription,
    stopTranscription,
    resetTranscription
  } = useSimpleWhisper({ autoPreload: false });

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Test Whisper Worker</h2>
      
      <div className="mb-4 space-y-2">
        <p>Engine Status: <span className="font-semibold">{engineStatus}</span></p>
        <p>Status: <span className="font-semibold">{status}</span></p>
        {engineStatus === 'loading' && <p>Progress: {loadProgress}%</p>}
        {isRecording && (
          <>
            <p>Recording Time: {recordingTime}s</p>
            <p>Audio Level: {audioLevel}</p>
          </>
        )}
        {error && <p className="text-red-500">Error: {error}</p>}
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={isRecording ? stopTranscription : startTranscription}
          disabled={engineStatus !== 'ready' && !isRecording}
          className={`px-4 py-2 rounded ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300'
          }`}
        >
          {isRecording ? 'Stop' : 'Start'} Recording
        </button>
        
        <button
          onClick={resetTranscription}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
        >
          Reset
        </button>
      </div>

      {transcription && (
        <div className="border p-4 rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Transcription:</h3>
          <p>{transcription.text}</p>
          {transcription.medicalTerms.length > 0 && (
            <div className="mt-2">
              <h4 className="font-semibold">Medical Terms:</h4>
              <p className="text-sm">{transcription.medicalTerms.join(', ')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}