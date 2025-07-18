import React from 'react';
import { useMedicalTranslation } from '@/src/domains/medical-ai/hooks/useMedicalTranslation';
import { Transcription } from '@/src/domains/medical-ai/hooks/aux_hooks/types';

interface FinalTranscriptionPanelProps {
  transcription: Transcription;
  isRecording: boolean;
}

export const FinalTranscriptionPanel: React.FC<FinalTranscriptionPanelProps> = ({
  transcription,
  isRecording,
}) => {
  const { t } = useMedicalTranslation();

  if (!transcription || isRecording) {
    return null;
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h3 className="font-semibold mb-2 text-green-900">
        {t('transcription.complete_transcription')}:
      </h3>
      
      <p className="text-gray-700 mb-3">
        {transcription.text}
      </p>
      
      {transcription.medicalTerms && transcription.medicalTerms.length > 0 && (
        <div className="mt-3">
          <p className="text-sm text-gray-600 mb-1">
            {t('transcription.detected_medical_terms')}:
          </p>
          <div className="flex flex-wrap gap-1">
            {transcription.medicalTerms.map((term, i) => (
              <span 
                key={i} 
                className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};