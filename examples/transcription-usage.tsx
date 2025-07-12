/**
 * Example Usage of Enhanced Transcription Panel
 * 
 * This shows how to integrate the enhanced transcription system
 */

import React from 'react';
import { ConversationCapture } from '../app/components/medical/ConversationCapture.tsx';

// Basic Usage Example
export const BasicTranscriptionExample = () => {
  const handleTranscriptionComplete = (text: string) => {
    console.log('Transcription completed:', text);
    // Handle the transcribed text here
    // e.g., save to database, display in form, etc.
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Enhanced Transcription Demo</h1>
      
      <ConversationCapture 
        onTranscriptionComplete={handleTranscriptionComplete}
        showModelInfo={true}
        showSpectrum={true}
        showAdvancedFeatures={true}
      />
    </div>
  );
};

// Advanced Usage with Custom Configuration
export const AdvancedTranscriptionExample = () => {
  const [transcribedText, setTranscribedText] = React.useState('');
  const [isVisible, setIsVisible] = React.useState(true);

  const handleTranscriptionComplete = (text: string) => {
    setTranscribedText(text);
    // Additional processing...
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transcription Panel */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Live Transcription</h2>
          {isVisible && (
            <ConversationCapture 
              onTranscriptionComplete={handleTranscriptionComplete}
              showModelInfo={process.env.NODE_ENV === 'development'}
              showSpectrum={true}
              showAdvancedFeatures={true}
              className="shadow-xl"
            />
          )}
          
          <button 
            onClick={() => setIsVisible(!isVisible)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isVisible ? 'Hide' : 'Show'} Transcription Panel
          </button>
        </div>
        
        {/* Results Display */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Transcription Results</h2>
          <div className="bg-gray-100 p-4 rounded-lg min-h-[300px]">
            <h3 className="font-medium mb-2">Final Transcript:</h3>
            <p className="text-gray-800 whitespace-pre-wrap">
              {transcribedText || 'No transcription yet...'}
            </p>
            
            {transcribedText && (
              <div className="mt-4 pt-4 border-t border-gray-300">
                <h4 className="font-medium mb-2">Actions:</h4>
                <div className="space-x-2">
                  <button 
                    onClick={() => navigator.clipboard.writeText(transcribedText)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Copy Text
                  </button>
                  <button 
                    onClick={() => setTranscribedText('')}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Medical Consultation Integration Example
export const MedicalConsultationExample = () => {
  const [patientNotes, setPatientNotes] = React.useState('');
  const [consultationData, setConsultationData] = React.useState({
    patientId: '',
    doctorId: '',
    transcript: '',
    timestamp: null as Date | null
  });

  const handleTranscriptionComplete = (text: string) => {
    const newConsultationData = {
      ...consultationData,
      transcript: text,
      timestamp: new Date()
    };
    
    setConsultationData(newConsultationData);
    setPatientNotes(prev => prev + '\n\nTranscribed Notes:\n' + text);
    
    // In a real app, you might save to backend here
    console.log('Consultation data updated:', newConsultationData);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Medical Consultation with Transcription</h1>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Patient Info */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-3">Patient Information</h3>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Name:</span> Juan Pérez</div>
            <div><span className="font-medium">Age:</span> 45</div>
            <div><span className="font-medium">ID:</span> PAT-001</div>
            <div><span className="font-medium">Chief Complaint:</span> Dolor de cabeza</div>
          </div>
        </div>
        
        {/* Transcription Panel */}
        <div className="xl:col-span-2">
          <ConversationCapture 
            onTranscriptionComplete={handleTranscriptionComplete}
            showModelInfo={true}
            showSpectrum={true}
            showAdvancedFeatures={true}
          />
        </div>
        
        {/* Consultation Notes */}
        <div className="xl:col-span-3">
          <h3 className="font-semibold mb-3">Consultation Notes</h3>
          <textarea
            value={patientNotes}
            onChange={(e) => setPatientNotes(e.target.value)}
            className="w-full h-48 p-3 border rounded-lg resize-none"
            placeholder="Type additional notes here or use voice transcription above..."
          />
          
          {consultationData.timestamp && (
            <div className="mt-2 text-sm text-gray-600">
              Last transcription: {consultationData.timestamp.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default {
  BasicTranscriptionExample,
  AdvancedTranscriptionExample,
  MedicalConsultationExample
};