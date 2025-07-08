import React from 'react';

interface DemoTranscriptionPanelProps {
  transcription: string;
  isRecording: boolean;
}

export const DemoTranscriptionPanel = ({ 
  transcription, 
  isRecording 
}: DemoTranscriptionPanelProps) => {
  return (
    <div className="demo-transcription-panel">
      <h3 className="font-semibold mb-2">Transcripción</h3>
      <div className="bg-gray-50 p-4 rounded-lg min-h-[200px]">
        {isRecording && (
          <div className="text-blue-600 mb-2">
            🎤 Grabando...
          </div>
        )}
        <div className="text-sm text-gray-700">
          {transcription || 'No hay transcripción disponible'}
        </div>
      </div>
    </div>
  );
};

export default DemoTranscriptionPanel;