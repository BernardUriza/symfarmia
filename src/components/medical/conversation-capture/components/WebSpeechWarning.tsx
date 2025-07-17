import React from 'react';

interface WebSpeechWarningProps {
  show: boolean;
}

export const WebSpeechWarning: React.FC<WebSpeechWarningProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Transcripción en tiempo real no disponible</p>
          <p className="text-blue-700">
            La transcripción final con Whisper estará disponible al detener la grabación.
          </p>
        </div>
      </div>
    </div>
  );
};