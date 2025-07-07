import { processMedicalQuery } from '@/app/services/MedicalAILogic.js';
import { MedicalAIConfig } from '@/app/config/MedicalAIConfig.js';

const MEDICAL_KEYWORDS = [
  'duele',
  'dolor',
  'enfermo',
  'síntoma',
  'fiebre',
  'cabeza',
  'estómago',
  'tos',
  'mareo',
  'náusea'
];

function generateContextualResponse(text: string) {
  if (/hola/i.test(text)) {
    return 'Hola, soy tu asistente médico. ¿En qué puedo ayudarte hoy?';
  }
  return 'Cuéntame más sobre tu consulta médica.';
}

export const processmedicalInput = async (userInput: string) => {
  const isMedicalQuery = MEDICAL_KEYWORDS.some(keyword =>
    userInput.toLowerCase().includes(keyword)
  );

  if (isMedicalQuery) {
    const dependencies = {
      config: MedicalAIConfig,
      httpClient: { fetch: (...args: any[]) => globalThis.fetch(...args) }
    };
    const medicalResponse = await processMedicalQuery(
      { query: userInput, type: 'diagnosis' },
      dependencies
    );
    return medicalResponse;
  }

  return { response: generateContextualResponse(userInput) };
};
