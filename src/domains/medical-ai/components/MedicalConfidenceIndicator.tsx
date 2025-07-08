import React from 'react';

interface MedicalConfidenceIndicatorProps {
  confidence: number;
}

export const MedicalConfidenceIndicator = ({ confidence }: MedicalConfidenceIndicatorProps) => (
  <div className="medical-confidence-indicator">
    <span className="font-medium">Confianza:</span> {Math.round(confidence * 100)}%
  </div>
);

export default MedicalConfidenceIndicator;
