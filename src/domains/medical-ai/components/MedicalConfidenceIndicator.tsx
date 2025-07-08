import React from 'react';

interface MedicalConfidenceIndicatorProps {
  confidence: number;
}

export const MedicalConfidenceIndicator: React.FC<MedicalConfidenceIndicatorProps> = ({ confidence }) => (
  <div className="medical-confidence-indicator">
    <span className="font-medium">Confianza:</span> {Math.round(confidence * 100)}%
  </div>
);

export default MedicalConfidenceIndicator;
