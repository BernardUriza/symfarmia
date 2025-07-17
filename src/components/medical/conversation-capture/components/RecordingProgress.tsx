import React from 'react';

interface RecordingProgressProps {
  show: boolean;
}

export const RecordingProgress: React.FC<RecordingProgressProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        Transcripción en progreso
      </h3>
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
          🎙️ Grabando audio con denoising activo...
        </p>
        <div className="text-sm text-gray-700 dark:text-gray-300">
          La transcripción completa estará disponible al finalizar.
        </div>
      </div>
    </div>
  );
};