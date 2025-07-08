import React from 'react';
import { MedicalAnalysis } from '../types';

interface AIAnalysisDisplayProps {
  analysis: MedicalAnalysis | null;
}

export const AIAnalysisDisplay: React.FC<AIAnalysisDisplayProps> = ({ analysis }) => {
  if (!analysis) return null;
  return (
    <div className="ai-analysis-display">
      <h4 className="font-semibold">AI Analysis</h4>
      <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(analysis.analysis, null, 2)}</pre>
    </div>
  );
};

export default AIAnalysisDisplay;
