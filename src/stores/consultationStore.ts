// Consultation store - handles medical consultations and transcriptions
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  ConsultationStore, 
  Consultation, 
  Transcription, 
  CreateConsultationData, 
  CreateTranscriptionData 
} from './types';
import { auditMiddleware, AuditState, AuditActions } from './middleware/auditMiddleware';
import { performanceMiddleware, PerformanceState, PerformanceActions } from './middleware/performanceMiddleware';

type ConsultationStoreWithMiddleware = ConsultationStore & AuditState & AuditActions & PerformanceState & PerformanceActions;

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useConsultationStore = create<ConsultationStoreWithMiddleware>()(
  persist(
    auditMiddleware(
      performanceMiddleware(
        devtools((set, get) => ({
          // Initial state
          consultations: [],
          activeConsultation: null,
          transcriptions: [],
          activeTranscription: null,
          loading: false,
          error: null,

          // Consultation actions
          setConsultations: (consultations) => {
            set({ consultations }, false, 'set_consultations');
          },

          addConsultation: (consultation) => {
            const fullConsultation: Consultation = {
              ...consultation,
              id: consultation.id || generateId(),
              transcriptionIds: consultation.transcriptionIds || [],
              createdAt: consultation.createdAt || Date.now(),
              updatedAt: Date.now()
            };

            set(
              (state) => ({
                consultations: [...state.consultations, fullConsultation]
              }),
              false,
              'add_consultation'
            );

            // Log consultation creation
            get().logAction({
              action: 'consultation_created',
              userId: null,
              resourceType: 'consultation',
              resourceId: fullConsultation.id,
              changes: {
                patientId: fullConsultation.patientId,
                patientName: fullConsultation.patientName,
                status: fullConsultation.status
              }
            });
          },

          updateConsultation: (id, updates) => {
            set(
              (state) => ({
                consultations: state.consultations.map(c =>
                  c.id === id
                    ? { ...c, ...updates, updatedAt: Date.now() }
                    : c
                )
              }),
              false,
              'update_consultation'
            );

            // Log consultation update
            get().logAction({
              action: 'consultation_updated',
              userId: null,
              resourceType: 'consultation',
              resourceId: id,
              changes: updates
            });

            // Update active consultation if it's the one being updated
            const currentState = get();
            if (currentState.activeConsultation?.id === id) {
              set({
                activeConsultation: {
                  ...currentState.activeConsultation,
                  ...updates,
                  updatedAt: Date.now()
                }
              });
            }
          },

          setActiveConsultation: (consultation) => {
            set({ activeConsultation: consultation }, false, 'set_active_consultation');

            if (consultation) {
              get().logAction({
                action: 'consultation_activated',
                userId: null,
                resourceType: 'consultation',
                resourceId: consultation.id,
                changes: { activated: true }
              });
            }
          },

          deleteConsultation: (id) => {
            const consultation = get().consultations.find(c => c.id === id);
            
            set(
              (state) => ({
                consultations: state.consultations.filter(c => c.id !== id),
                activeConsultation: state.activeConsultation?.id === id ? null : state.activeConsultation
              }),
              false,
              'delete_consultation'
            );

            // Log consultation deletion
            get().logAction({
              action: 'consultation_deleted',
              userId: null,
              resourceType: 'consultation',
              resourceId: id,
              changes: {
                deletedConsultation: consultation ? {
                  patientName: consultation.patientName,
                  status: consultation.status
                } : null
              }
            });
          },

          // Transcription actions
          addTranscription: (transcription) => {
            const fullTranscription: Transcription = {
              ...transcription,
              id: transcription.id || generateId(),
              createdAt: transcription.createdAt || Date.now(),
              updatedAt: Date.now()
            };

            set(
              (state) => ({
                transcriptions: [...state.transcriptions, fullTranscription]
              }),
              false,
              'add_transcription'
            );

            // Link transcription to consultation
            if (fullTranscription.consultationId) {
              get().updateConsultation(fullTranscription.consultationId, {
                transcriptionIds: [
                  ...get().consultations.find(c => c.id === fullTranscription.consultationId)?.transcriptionIds || [],
                  fullTranscription.id
                ]
              });
            }

            // Log transcription creation
            get().logAction({
              action: 'transcription_created',
              userId: null,
              resourceType: 'consultation',
              resourceId: fullTranscription.consultationId,
              changes: {
                transcriptionId: fullTranscription.id,
                status: fullTranscription.status,
                contentLength: fullTranscription.content.length
              }
            });
          },

          updateTranscription: (id, updates) => {
            set(
              (state) => ({
                transcriptions: state.transcriptions.map(t =>
                  t.id === id
                    ? { ...t, ...updates, updatedAt: Date.now() }
                    : t
                )
              }),
              false,
              'update_transcription'
            );

            // Log transcription update
            get().logAction({
              action: 'transcription_updated',
              userId: null,
              resourceType: 'consultation',
              resourceId: id,
              changes: updates
            });

            // Update active transcription if it's the one being updated
            const currentState = get();
            if (currentState.activeTranscription?.id === id) {
              set({
                activeTranscription: {
                  ...currentState.activeTranscription,
                  ...updates,
                  updatedAt: Date.now()
                }
              });
            }
          },

          setActiveTranscription: (transcription) => {
            set({ activeTranscription: transcription }, false, 'set_active_transcription');

            if (transcription) {
              get().logAction({
                action: 'transcription_activated',
                userId: null,
                resourceType: 'consultation',
                resourceId: transcription.consultationId,
                changes: { 
                  activeTranscriptionId: transcription.id,
                  status: transcription.status 
                }
              });
            }
          },

          // Async operations
          fetchConsultations: async () => {
            set({ loading: true, error: null }, false, 'fetch_consultations_start');

            try {
              const startTime = performance.now();
              
              const response = await fetch('/api/consultations');
              
              if (!response.ok) {
                throw new Error('Failed to fetch consultations');
              }

              const consultations = await response.json();
              const duration = performance.now() - startTime;

              set({ 
                consultations, 
                loading: false 
              }, false, 'fetch_consultations_success');

              // Record performance
              get().recordMetric({
                action: 'fetch_consultations_api',
                duration,
                metadata: {
                  consultationCount: consultations.length,
                  success: true
                }
              });

              // Log successful fetch
              get().logAction({
                action: 'consultations_fetched',
                userId: null,
                resourceType: 'consultation',
                changes: {
                  count: consultations.length,
                  duration: `${duration.toFixed(2)}ms`
                }
              });

            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Failed to fetch consultations';
              
              set({ 
                error: errorMessage, 
                loading: false 
              }, false, 'fetch_consultations_error');

              // Log error
              get().logAction({
                action: 'consultations_fetch_failed',
                userId: null,
                resourceType: 'consultation',
                changes: { error: errorMessage }
              });
            }
          },

          // Complex workflow operation
          createConsultationWithTranscription: async (consultationData, transcriptionData) => {
            set({ loading: true, error: null }, false, 'create_consultation_with_transcription_start');

            try {
              const startTime = performance.now();
              
              const consultationId = generateId();
              const transcriptionId = generateId();

              // Create consultation
              const consultation: Consultation = {
                ...consultationData,
                id: consultationId,
                transcriptionIds: [transcriptionId],
                status: 'active',
                createdAt: Date.now(),
                updatedAt: Date.now()
              };

              // Create transcription
              const transcription: Transcription = {
                ...transcriptionData,
                id: transcriptionId,
                consultationId,
                status: 'recording',
                createdAt: Date.now(),
                updatedAt: Date.now()
              };

              // Update state
              set(
                (state) => ({
                  consultations: [...state.consultations, consultation],
                  transcriptions: [...state.transcriptions, transcription],
                  activeConsultation: consultation,
                  activeTranscription: transcription,
                  loading: false
                }),
                false,
                'create_consultation_with_transcription_success'
              );

              const duration = performance.now() - startTime;

              // Record performance
              get().recordMetric({
                action: 'create_consultation_with_transcription',
                duration,
                metadata: {
                  patientId: consultationData.patientId,
                  success: true
                }
              });

              // Log successful creation
              get().logAction({
                action: 'consultation_with_transcription_created',
                userId: null,
                resourceType: 'consultation',
                resourceId: consultationId,
                changes: {
                  consultationId,
                  transcriptionId,
                  patientId: consultationData.patientId,
                  patientName: consultationData.patientName
                }
              });

            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Failed to create consultation';
              
              set({ 
                error: errorMessage, 
                loading: false 
              }, false, 'create_consultation_with_transcription_error');

              // Log error
              get().logAction({
                action: 'consultation_with_transcription_creation_failed',
                userId: null,
                resourceType: 'consultation',
                changes: { 
                  error: errorMessage,
                  patientId: consultationData.patientId 
                }
              });
            }
          }
        }), {
          name: 'consultation-store',
          version: 1
        })
      )
    ),
    {
      name: 'symfarmia-consultation-storage',
      partialize: (state) => ({
        // Persist consultation data
        consultations: state.consultations,
        transcriptions: state.transcriptions,
        // Don't persist active states or loading/error states
      }),
      skipHydration: true,
    }
  )
);

// Selectors for common use cases
export const useConsultations = () => useConsultationStore((state) => state.consultations);
export const useActiveConsultation = () => useConsultationStore((state) => state.activeConsultation);
export const useTranscriptions = () => useConsultationStore((state) => state.transcriptions);
export const useActiveTranscription = () => useConsultationStore((state) => state.activeTranscription);
export const useConsultationLoading = () => useConsultationStore((state) => state.loading);
export const useConsultationError = () => useConsultationStore((state) => state.error);

// Consultation-specific selectors
export const useConsultationsByPatient = (patientId: string) =>
  useConsultationStore((state) => state.consultations.filter(c => c.patientId === patientId));

export const useTranscriptionsByConsultation = (consultationId: string) =>
  useConsultationStore((state) => state.transcriptions.filter(t => t.consultationId === consultationId));

// Action selectors
export const useConsultationActions = () => useConsultationStore((state) => ({
  addConsultation: state.addConsultation,
  updateConsultation: state.updateConsultation,
  setActiveConsultation: state.setActiveConsultation,
  deleteConsultation: state.deleteConsultation,
  addTranscription: state.addTranscription,
  updateTranscription: state.updateTranscription,
  setActiveTranscription: state.setActiveTranscription,
  fetchConsultations: state.fetchConsultations,
  createConsultationWithTranscription: state.createConsultationWithTranscription
}));