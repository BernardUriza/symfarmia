import { MedicalCategory } from '../types';

export const medicalTermsDatabase = {
  symptoms: [
    { term: 'cefalea', synonyms: ['dolor de cabeza', 'jaqueca'], category: MedicalCategory.SYMPTOM },
    { term: 'pirexia', synonyms: ['fiebre', 'temperatura elevada'], category: MedicalCategory.SYMPTOM },
    { term: 'disnea', synonyms: ['dificultad respiratoria', 'falta de aire'], category: MedicalCategory.SYMPTOM },
    { term: 'taquicardia', synonyms: ['pulso rápido', 'latidos acelerados'], category: MedicalCategory.SYMPTOM },
    { term: 'hipertensión', synonyms: ['presión alta', 'tensión arterial elevada'], category: MedicalCategory.DIAGNOSIS },
    { term: 'diabetes', synonyms: ['diabetes mellitus', 'azúcar alta'], category: MedicalCategory.DIAGNOSIS },
    { term: 'anemia', synonyms: ['hemoglobina baja', 'déficit de hierro'], category: MedicalCategory.DIAGNOSIS }
  ],
  medications: [
    { term: 'paracetamol', synonyms: ['acetaminofén'], category: MedicalCategory.MEDICATION },
    { term: 'ibuprofeno', synonyms: ['antiinflamatorio'], category: MedicalCategory.MEDICATION },
    { term: 'amoxicilina', synonyms: ['antibiótico'], category: MedicalCategory.MEDICATION },
    { term: 'omeprazol', synonyms: ['protector gástrico'], category: MedicalCategory.MEDICATION }
  ],
  procedures: [
    { term: 'hemograma', synonyms: ['análisis de sangre', 'conteo sanguíneo'], category: MedicalCategory.PROCEDURE },
    { term: 'radiografía', synonyms: ['rayos x', 'rx'], category: MedicalCategory.PROCEDURE },
    { term: 'electrocardiograma', synonyms: ['ecg', 'ekg'], category: MedicalCategory.PROCEDURE },
    { term: 'ecografía', synonyms: ['ultrasonido', 'eco'], category: MedicalCategory.PROCEDURE }
  ]
};

export const findMedicalTerm = (text: string): { term: string; category: MedicalCategory } | null => {
  const lowerText = text.toLowerCase();
  
  for (const category of Object.values(medicalTermsDatabase)) {
    for (const item of category) {
      if (lowerText.includes(item.term.toLowerCase()) || 
          item.synonyms.some(syn => lowerText.includes(syn.toLowerCase()))) {
        return { term: item.term, category: item.category };
      }
    }
  }
  
  return null;
};

export const extractMedicalTermsFromText = (text: string): Array<{ term: string; category: MedicalCategory }> => {
  const terms: Array<{ term: string; category: MedicalCategory }> = [];
  const words = text.toLowerCase().split(/\s+/);
  
  for (const word of words) {
    const medicalTerm = findMedicalTerm(word);
    if (medicalTerm && !terms.some(t => t.term === medicalTerm.term)) {
      terms.push(medicalTerm);
    }
  }
  
  return terms;
};