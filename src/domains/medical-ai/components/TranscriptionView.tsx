import React from 'react';
import { TranscriptionResult } from '../types';

interface TranscriptionViewProps {
  transcription: TranscriptionResult;
  onEdit?: (id: string, text: string) => void;
}

export const TranscriptionView = ({ 
  transcription, 
  onEdit 
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Transcripción</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-gray-500">
            {new Date(transcription.timestamp).toLocaleString()}
          </span>
          <span className="text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">
            Confianza: {(transcription.confidence * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="prose max-w-none">
        <p className="text-gray-700 whitespace-pre-wrap">{transcription.text}</p>
      </div>

      {transcription.medicalTerms.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Términos médicos identificados
          </h4>
          <div className="flex flex-wrap gap-2">
            {transcription.medicalTerms.map((term, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                title={term.definition}
              >
                {term.term}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};