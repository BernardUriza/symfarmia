import { processMedicalQuery } from '@/app/services/MedicalAILogic';
import { MedicalAIConfig } from '@/src/lib/config/MedicalAIConfig';

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
      httpClient: { fetch: (input: RequestInfo | URL, init?: RequestInit) => globalThis.fetch(input, init) }
    };
    const medicalResponse = await processMedicalQuery(
      { query: userInput, context: { timestamp: new Date(), source: 'user_input' }, type: 'diagnosis' },
      dependencies
    );
    return medicalResponse;
  }

  return { response: generateContextualResponse(userInput) };
};
