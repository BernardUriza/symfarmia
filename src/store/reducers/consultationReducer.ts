// Consultation-specific reducer with optimized updates
import type { AppState, MedicalStateAction } from '../types';
import type { SOAPNotes } from '../../types/medical';
import { createInitialConsultation } from '../utils/consultationUtils';

export function consultationReducer(
  state: AppState['consultations'],
  action: MedicalStateAction
): AppState['consultations'] {
  switch (action.type) {
    case 'START_CONSULTATION': {
      const consultationId = crypto.randomUUID();
      const payload = action.payload as { patientInfo?: any; settings?: any };
      const newConsultation = createInitialConsultation(
        consultationId,
        payload.patientInfo,
        payload.settings
      );
      
      return {
        ...state,
        active: {
          ...state.active,
          [consultationId]: newConsultation
        },
        current: consultationId,
        history: [consultationId, ...state.history.slice(0, 9)] // Keep last 10
      };
    }
    
    case 'END_CONSULTATION': {
      const { consultationId, reason } = action.payload as { consultationId: string; reason: string };
      const consultation = state.active[consultationId];
      
      if (!consultation) return state;
      
      const completedConsultation = {
        ...consultation,
        status: reason === 'completed' ? 'completed' as const : 'archived' as const,
        session: {
          ...consultation.session,
          endTime: new Date(),
          status: reason === 'completed' ? 'completed' as const : 'cancelled' as const
        },
        metadata: {
          ...consultation.metadata,
          lastActivity: new Date()
        }
      };
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [consultationId]: _, ...remainingActive } = state.active;
      
      return {
        ...state,
        active: remainingActive,
        archived: {
          ...state.archived,
          [consultationId]: {
            id: completedConsultation.id,
            session: completedConsultation.session,
            documentation: completedConsultation.documentation,
            patient: completedConsultation.patient,
            symptoms: completedConsultation.symptoms,
            diagnoses: completedConsultation.diagnoses,
            treatmentPlan: completedConsultation.treatmentPlan,
            metadata: completedConsultation.metadata
          }
        },
        current: state.current === consultationId ? undefined : state.current
      };
    }
    
    case 'PAUSE_CONSULTATION': {
      const { consultationId } = action.payload as { consultationId: string };
      const consultation = state.active[consultationId];
      
      if (!consultation) return state;
      
      return {
        ...state,
        active: {
          ...state.active,
          [consultationId]: {
            ...consultation,
            status: 'paused',
            transcription: {
              ...consultation.transcription,
              isPaused: true
            }
          }
        }
      };
    }
    
    case 'RESUME_CONSULTATION': {
      const { consultationId } = action.payload as { consultationId: string };
      const consultation = state.active[consultationId];
      
      if (!consultation) return state;
      
      return {
        ...state,
        active: {
          ...state.active,
          [consultationId]: {
            ...consultation,
            status: 'active',
            transcription: {
              ...consultation.transcription,
              isPaused: false
            },
            metadata: {
              ...consultation.metadata,
              lastActivity: new Date()
            }
          }
        }
      };
    }
    
    case 'START_RECORDING': {
      const { consultationId } = action.payload as { consultationId: string };
      const consultation = state.active[consultationId];
      
      if (!consultation) return state;
      
      return {
        ...state,
        active: {
          ...state.active,
          [consultationId]: {
            ...consultation,
            transcription: {
              ...consultation.transcription,
              isRecording: true,
              isPaused: false
            },
            session: {
              ...consultation.session,
              startTime: consultation.session.startTime || new Date()
            }
          }
        }
      };
    }
    
    case 'STOP_RECORDING': {
      const { consultationId, duration } = action.payload as { consultationId: string; duration: number };
      const consultation = state.active[consultationId];
      
      if (!consultation) return state;
      
      return {
        ...state,
        active: {
          ...state.active,
          [consultationId]: {
            ...consultation,
            transcription: {
              ...consultation.transcription,
              isRecording: false,
              isPaused: false
            },
            session: {
              ...consultation.session,
              duration: (consultation.session.duration || 0) + duration
            }
          }
        }
      };
    }
    
    case 'UPDATE_LIVE_TRANSCRIPT': {
      const { consultationId, text, confidence } = action.payload as { consultationId: string; text: string; confidence: number };
      const consultation = state.active[consultationId];
      
      if (!consultation) return state;
      
      return {
        ...state,
        active: {
          ...state.active,
          [consultationId]: {
            ...consultation,
            transcription: {
              ...consultation.transcription,
              liveTranscript: text,
              confidence: confidence
            }
          }
        }
      };
    }
    
    case 'FINALIZE_TRANSCRIPT': {
      const { consultationId, transcription } = action.payload as { consultationId: string; transcription: any };
      const consultation = state.active[consultationId];
      
      if (!consultation) return state;
      
      const updatedTranscriptions = [...consultation.transcription.transcriptions];
      
      // Optimize: Keep only last 100 transcriptions for memory management
      if (updatedTranscriptions.length >= 100) {
        updatedTranscriptions.splice(0, updatedTranscriptions.length - 99);
      }
      
      updatedTranscriptions.push(transcription);
      
      return {
        ...state,
        active: {
          ...state.active,
          [consultationId]: {
            ...consultation,
            transcription: {
              ...consultation.transcription,
              finalTranscript: consultation.transcription.finalTranscript + ' ' + transcription.text,
              transcriptions: updatedTranscriptions,
              liveTranscript: ''
            },
            session: {
              ...consultation.session,
              transcript: updatedTranscriptions
            }
          }
        }
      };
    }
    
    case 'UPDATE_AUDIO_LEVEL': {
      const { consultationId, level } = action.payload as { consultationId: string; level: number };
      const consultation = state.active[consultationId];
      
      if (!consultation) return state;
      
      // Throttle audio level updates for performance
      const now = Date.now();
      const lastUpdate = consultation.metadata.lastActivity.getTime();
      
      if (now - lastUpdate < 100) { // Update max every 100ms
        return state;
      }
      
      return {
        ...state,
        active: {
          ...state.active,
          [consultationId]: {
            ...consultation,
            transcription: {
              ...consultation.transcription,
              audioLevel: level
            },
            metadata: {
              ...consultation.metadata,
              lastActivity: new Date()
            }
          }
        }
      };
    }
    
    case 'ADD_AI_MESSAGE': {
      const { consultationId, message } = action.payload as { consultationId: string; message: any };
      const consultation = state.active[consultationId];
      
      if (!consultation) return state;
      
      const updatedMessages = [...consultation.ai.messages];
      
      // Optimize: Keep only last 50 messages for memory management
      if (updatedMessages.length >= 50) {
        updatedMessages.splice(0, updatedMessages.length - 49);
      }
      
      updatedMessages.push({
        ...message,
        id: message.id || crypto.randomUUID(),
        timestamp: message.timestamp || new Date()
      });
      
      return {
        ...state,
        active: {
          ...state.active,
          [consultationId]: {
            ...consultation,
            ai: {
              ...consultation.ai,
              messages: updatedMessages
            },
            session: {
              ...consultation.session,
              aiSuggestions: updatedMessages
            }
          }
        }
      };
    }
    
    case 'SET_AI_THINKING': {
      const { consultationId, thinking } = action.payload as { consultationId: string; thinking: boolean };
      const consultation = state.active[consultationId];
      
      if (!consultation) return state;
      
      return {
        ...state,
        active: {
          ...state.active,
          [consultationId]: {
            ...consultation,
            ai: {
              ...consultation.ai,
              isThinking: thinking
            }
          }
        }
      };
    }
    
    case 'UPDATE_AI_MODE': {
      const { consultationId, mode } = action.payload as { consultationId: string; mode: 'basic' | 'advanced' | 'expert' };
      const consultation = state.active[consultationId];
      
      if (!consultation) return state;
      
      return {
        ...state,
        active: {
          ...state.active,
          [consultationId]: {
            ...consultation,
            ai: {
              ...consultation.ai,
              mode: mode
            }
          }
        }
      };
    }
    
    case 'ADD_CLINICAL_ALERT': {
      const { consultationId, alert } = action.payload as { consultationId: string; alert: any };
      const consultation = state.active[consultationId];
      
      if (!consultation) return state;
      
      const updatedAlerts = [...consultation.ai.clinicalAlerts];
      
      // Avoid duplicate alerts
      const existingAlert = updatedAlerts.find(a => 
        a.title === alert.title && a.category === alert.category
      );
      
      if (existingAlert) return state;
      
      updatedAlerts.push({
        ...alert,
        id: alert.id || crypto.randomUUID(),
        timestamp: alert.timestamp || new Date()
      });
      
      return {
        ...state,
        active: {
          ...state.active,
          [consultationId]: {
            ...consultation,
            ai: {
              ...consultation.ai,
              clinicalAlerts: updatedAlerts
            },
            session: {
              ...consultation.session,
              clinicalAlerts: updatedAlerts
            }
          }
        }
      };
    }
    
    case 'DISMISS_ALERT': {
      const { consultationId, alertId } = action.payload as { consultationId: string; alertId: string };
      const consultation = state.active[consultationId];
      
      if (!consultation) return state;
      
      const updatedAlerts = consultation.ai.clinicalAlerts.map(alert =>
        alert.id === alertId ? { ...alert, dismissed: true } : alert
      );
      
      return {
        ...state,
        active: {
          ...state.active,
          [consultationId]: {
            ...consultation,
            ai: {
              ...consultation.ai,
              clinicalAlerts: updatedAlerts
            }
          }
        }
      };
    }
    
    case 'UPDATE_SOAP_SECTION': {
      const { consultationId, section, content } = action.payload as { consultationId: string; section: keyof SOAPNotes; content: string };
      const consultation = state.active[consultationId];
      
      if (!consultation) return state;
      
      const previousValue = String(consultation.documentation.soapNotes[section] || '');
      
      const updatedEditHistory = [...consultation.documentation.editHistory];
      updatedEditHistory.push({
        section,
        previousValue,
        newValue: content,
        timestamp: new Date(),
        userId: action.meta?.userId
      });
      
      // Keep only last 20 edit history entries
      if (updatedEditHistory.length > 20) {
        updatedEditHistory.splice(0, updatedEditHistory.length - 20);
      }
      
      return {
        ...state,
        active: {
          ...state.active,
          [consultationId]: {
            ...consultation,
            documentation: {
              ...consultation.documentation,
              soapNotes: {
                ...consultation.documentation.soapNotes,
                [section]: content
              },
              editHistory: updatedEditHistory,
              lastSaved: new Date()
            }
          }
        }
      };
    }
    
    case 'START_SOAP_GENERATION': {
      const { consultationId } = action.payload as { consultationId: string };
      const consultation = state.active[consultationId];
      
      if (!consultation) return state;
      
      return {
        ...state,
        active: {
          ...state.active,
          [consultationId]: {
            ...consultation,
            documentation: {
              ...consultation.documentation,
              isGenerating: true,
              generationProgress: 0
            }
          }
        }
      };
    }
    
    case 'UPDATE_SOAP_PROGRESS': {
      const { consultationId, progress } = action.payload as { consultationId: string; progress: number };
      const consultation = state.active[consultationId];
      
      if (!consultation) return state;
      
      return {
        ...state,
        active: {
          ...state.active,
          [consultationId]: {
            ...consultation,
            documentation: {
              ...consultation.documentation,
              generationProgress: Math.min(100, Math.max(0, progress))
            }
          }
        }
      };
    }
    
    case 'COMPLETE_SOAP_GENERATION': {
      const { consultationId, soapNotes } = action.payload as { consultationId: string; soapNotes: any };
      const consultation = state.active[consultationId];
      
      if (!consultation) return state;
      
      return {
        ...state,
        active: {
          ...state.active,
          [consultationId]: {
            ...consultation,
            documentation: {
              ...consultation.documentation,
              soapNotes: {
                ...consultation.documentation.soapNotes,
                ...soapNotes
              },
              isGenerating: false,
              generationProgress: 100,
              lastSaved: new Date()
            },
            session: {
              ...consultation.session,
              soapNotes: {
                ...consultation.documentation.soapNotes,
                ...soapNotes
              }
            }
          }
        }
      };
    }
    
    case 'ADD_SYMPTOM': {
      const { consultationId, symptom } = action.payload as { consultationId: string; symptom: any };
      const consultation = state.active[consultationId];
      
      if (!consultation) return state;
      
      const updatedSymptoms = [...consultation.symptoms];
      
      // Avoid duplicate symptoms
      const existingSymptom = updatedSymptoms.find(s => s.name === symptom.name);
      if (existingSymptom) {
        // Update existing symptom
        const index = updatedSymptoms.indexOf(existingSymptom);
        updatedSymptoms[index] = { ...existingSymptom, ...symptom };
      } else {
        updatedSymptoms.push(symptom);
      }
      
      return {
        ...state,
        active: {
          ...state.active,
          [consultationId]: {
            ...consultation,
            symptoms: updatedSymptoms,
            session: {
              ...consultation.session,
              symptoms: updatedSymptoms
            }
          }
        }
      };
    }
    
    case 'UPDATE_VITAL_SIGNS': {
      const { consultationId, vitalSigns } = action.payload as { consultationId: string; vitalSigns: any };
      const consultation = state.active[consultationId];
      
      if (!consultation) return state;
      
      return {
        ...state,
        active: {
          ...state.active,
          [consultationId]: {
            ...consultation,
            vitalSigns: {
              ...consultation.vitalSigns,
              ...vitalSigns
            },
            session: {
              ...consultation.session,
              vitalSigns: {
                ...consultation.vitalSigns,
                ...vitalSigns
              }
            }
          }
        }
      };
    }
    
    case 'ADD_DIAGNOSIS': {
      const { consultationId, diagnosis } = action.payload as { consultationId: string; diagnosis: any };
      const consultation = state.active[consultationId];
      
      if (!consultation) return state;
      
      const updatedDiagnoses = [...consultation.diagnoses];
      
      // Avoid duplicate diagnoses
      const existingDiagnosis = updatedDiagnoses.find(d => d.name === diagnosis.name);
      if (!existingDiagnosis) {
        updatedDiagnoses.push(diagnosis);
        
        // Sort by probability (highest first)
        updatedDiagnoses.sort((a, b) => b.probability - a.probability);
      }
      
      return {
        ...state,
        active: {
          ...state.active,
          [consultationId]: {
            ...consultation,
            diagnoses: updatedDiagnoses,
            session: {
              ...consultation.session,
              diagnosisCandidates: updatedDiagnoses
            }
          }
        }
      };
    }
    
    case 'UPDATE_TREATMENT_PLAN': {
      const { consultationId, treatmentPlan } = action.payload as { consultationId: string; treatmentPlan: any };
      const consultation = state.active[consultationId];
      
      if (!consultation) return state;
      
      return {
        ...state,
        active: {
          ...state.active,
          [consultationId]: {
            ...consultation,
            treatmentPlan: {
              ...consultation.treatmentPlan,
              ...treatmentPlan
            },
            session: {
              ...consultation.session,
              treatmentPlan: {
                ...consultation.treatmentPlan,
                ...treatmentPlan
              }
            }
          }
        }
      };
    }
    
    default:
      return state;
  }
}
