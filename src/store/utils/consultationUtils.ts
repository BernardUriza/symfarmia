// Utility functions for creating and managing consultation state
import type { ConsultationState } from '../types';
import type { PatientInfo, ConsultationSettings } from '../../types/medical';

export function createInitialConsultation(
  id: string,
  patientInfo?: PatientInfo,
  _settings?: Partial<ConsultationSettings>
): ConsultationState {
  return {
    id,
    session: {
      id,
      startTime: new Date(),
      endTime: undefined,
      duration: 0,
      status: 'active',
      transcript: [],
      aiSuggestions: [],
      soapNotes: {
        subjective: '',
        objective: '',
        assessment: '',
        plan: ''
      },
      symptoms: [],
      vitalSigns: {},
      diagnosisCandidates: [],
      treatmentPlan: {},
      clinicalAlerts: []
    },
    status: 'active',
    transcription: {
      isRecording: false,
      isPaused: false,
      liveTranscript: '',
      finalTranscript: '',
      confidence: 0,
      audioLevel: 0,
      transcriptions: []
    },
    ai: {
      isThinking: false,
      mode: 'basic',
      messages: [],
      clinicalAlerts: []
    },
    patient: {
      id: patientInfo?.id as string || crypto.randomUUID(),
      name: patientInfo?.name as string || 'Unknown Patient'
    },
    documentation: {
      soapNotes: {
        subjective: '',
        objective: '',
        assessment: '',
        plan: ''
      },
      isGenerating: false,
      generationProgress: 0,
      editHistory: [],
      lastSaved: new Date()
    },
    symptoms: [],
    vitalSigns: {},
    diagnoses: [],
    treatmentPlan: {},
    metadata: {
      createdAt: new Date(),
      lastActivity: new Date(),
      version: 1
    }
  };
}