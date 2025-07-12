/**
 * MedicalTerminologyEnhancer
 * 
 * Enhanced medical terminology processing for Spanish medical transcriptions
 * Corrects common medical terms and improves accuracy
 */

import { MedicalCategory } from '../types';

export class MedicalTerminologyEnhancer {
  constructor(config = {}) {
    this.config = {
      language: config.language || 'es-MX',
      confidenceThreshold: config.confidenceThreshold || 0.7,
      enableSpellCheck: config.enableSpellCheck !== false,
      enableContextualCorrection: config.enableContextualCorrection !== false,
      ...config
    };

    this.medicalDictionary = null;
    this.contextualRules = null;
    this.commonErrors = null;
    this.isInitialized = false;
  }

  /**
   * Initialize medical terminology enhancer
   */
  async initialize() {
    try {
      // Load medical dictionary
      this.medicalDictionary = await this.loadMedicalDictionary();
      
      // Load contextual correction rules
      this.contextualRules = await this.loadContextualRules();
      
      // Load common error patterns
      this.commonErrors = await this.loadCommonErrors();
      
      this.isInitialized = true;
      console.log('MedicalTerminologyEnhancer initialized');
      
    } catch (error) {
      console.error('Failed to initialize MedicalTerminologyEnhancer:', error);
      throw error;
    }
  }

  /**
   * Load medical dictionary for Spanish
   */
  async loadMedicalDictionary() {
    return {
      // Diagnósticos
      diagnosticos: [
        { term: 'hipertensión', variants: ['hipertension', 'presión alta'], category: MedicalCategory.DIAGNOSIS },
        { term: 'diabetes', variants: ['diabetes mellitus', 'diabetis'], category: MedicalCategory.DIAGNOSIS },
        { term: 'asma', variants: ['asma bronquial'], category: MedicalCategory.DIAGNOSIS },
        { term: 'neumonía', variants: ['neumonia', 'pulmonia'], category: MedicalCategory.DIAGNOSIS },
        { term: 'gastritis', variants: ['gastritis crónica'], category: MedicalCategory.DIAGNOSIS },
        { term: 'migraña', variants: ['jaqueca', 'cefalea'], category: MedicalCategory.DIAGNOSIS },
        { term: 'artritis', variants: ['artritis reumatoide'], category: MedicalCategory.DIAGNOSIS },
        { term: 'anemia', variants: ['anemia ferropénica'], category: MedicalCategory.DIAGNOSIS },
        { term: 'bronquitis', variants: ['bronquitis aguda'], category: MedicalCategory.DIAGNOSIS },
        { term: 'otitis', variants: ['otitis media'], category: MedicalCategory.DIAGNOSIS }
      ],
      
      // Síntomas
      sintomas: [
        { term: 'fiebre', variants: ['calentura', 'temperatura'], category: MedicalCategory.SYMPTOM },
        { term: 'dolor', variants: ['dolor intenso', 'molestia'], category: MedicalCategory.SYMPTOM },
        { term: 'nauseas', variants: ['náuseas', 'ganas de vomitar'], category: MedicalCategory.SYMPTOM },
        { term: 'mareos', variants: ['vértigo', 'mareado'], category: MedicalCategory.SYMPTOM },
        { term: 'fatiga', variants: ['cansancio', 'debilidad'], category: MedicalCategory.SYMPTOM },
        { term: 'disnea', variants: ['dificultad para respirar', 'falta de aire'], category: MedicalCategory.SYMPTOM },
        { term: 'tos', variants: ['tos seca', 'tos productiva'], category: MedicalCategory.SYMPTOM },
        { term: 'dolor de cabeza', variants: ['cefalea', 'dolor cefálico'], category: MedicalCategory.SYMPTOM },
        { term: 'dolor abdominal', variants: ['dolor de estómago', 'dolor de barriga'], category: MedicalCategory.SYMPTOM },
        { term: 'palpitaciones', variants: ['taquicardia', 'corazón acelerado'], category: MedicalCategory.SYMPTOM }
      ],
      
      // Tratamientos
      tratamientos: [
        { term: 'antibiótico', variants: ['antibiotico', 'antimicrobiano'], category: MedicalCategory.TREATMENT },
        { term: 'analgésico', variants: ['analgesico', 'calmante'], category: MedicalCategory.TREATMENT },
        { term: 'antiinflamatorio', variants: ['anti-inflamatorio', 'desinflamatorio'], category: MedicalCategory.TREATMENT },
        { term: 'antihistamínico', variants: ['antihistaminico', 'antialérgico'], category: MedicalCategory.TREATMENT },
        { term: 'broncodilatador', variants: ['inhalador', 'nebulización'], category: MedicalCategory.TREATMENT },
        { term: 'antihipertensivo', variants: ['medicamento para la presión'], category: MedicalCategory.TREATMENT },
        { term: 'insulina', variants: ['insulina rápida', 'insulina lenta'], category: MedicalCategory.TREATMENT },
        { term: 'corticoide', variants: ['cortisona', 'esteroide'], category: MedicalCategory.TREATMENT },
        { term: 'diurético', variants: ['diuretico', 'pastilla para orinar'], category: MedicalCategory.TREATMENT },
        { term: 'suplemento', variants: ['vitamina', 'complemento'], category: MedicalCategory.TREATMENT }
      ],
      
      // Procedimientos
      procedimientos: [
        { term: 'radiografía', variants: ['rayos X', 'placa'], category: MedicalCategory.PROCEDURE },
        { term: 'análisis de sangre', variants: ['examen de sangre', 'laboratorio'], category: MedicalCategory.PROCEDURE },
        { term: 'electrocardiograma', variants: ['ECG', 'electro'], category: MedicalCategory.PROCEDURE },
        { term: 'ecografía', variants: ['ultrasonido', 'eco'], category: MedicalCategory.PROCEDURE },
        { term: 'tomografía', variants: ['TAC', 'escáner'], category: MedicalCategory.PROCEDURE },
        { term: 'resonancia magnética', variants: ['RM', 'resonancia'], category: MedicalCategory.PROCEDURE },
        { term: 'biopsia', variants: ['muestra de tejido'], category: MedicalCategory.PROCEDURE },
        { term: 'endoscopia', variants: ['endoscopía'], category: MedicalCategory.PROCEDURE },
        { term: 'colonoscopia', variants: ['colonoscopía'], category: MedicalCategory.PROCEDURE },
        { term: 'cirugía', variants: ['operación', 'intervención'], category: MedicalCategory.PROCEDURE }
      ],
      
      // Anatomía
      anatomia: [
        { term: 'corazón', variants: ['corazon', 'cardíaco'], category: MedicalCategory.ANATOMY },
        { term: 'pulmón', variants: ['pulmon', 'pulmonar'], category: MedicalCategory.ANATOMY },
        { term: 'hígado', variants: ['higado', 'hepático'], category: MedicalCategory.ANATOMY },
        { term: 'riñón', variants: ['riñon', 'renal'], category: MedicalCategory.ANATOMY },
        { term: 'estómago', variants: ['estomago', 'gástrico'], category: MedicalCategory.ANATOMY },
        { term: 'cerebro', variants: ['cerebral', 'encéfalo'], category: MedicalCategory.ANATOMY },
        { term: 'columna', variants: ['columna vertebral', 'espina dorsal'], category: MedicalCategory.ANATOMY },
        { term: 'articulación', variants: ['articulacion', 'coyuntura'], category: MedicalCategory.ANATOMY },
        { term: 'músculo', variants: ['musculo', 'muscular'], category: MedicalCategory.ANATOMY },
        { term: 'hueso', variants: ['óseo', 'esquelético'], category: MedicalCategory.ANATOMY }
      ]
    };
  }

  /**
   * Load contextual correction rules
   */
  async loadContextualRules() {
    return [
      {
        pattern: /dolor de (cabeza|estómago|espalda|pecho)/gi,
        context: 'symptom',
        correction: (match) => match.toLowerCase()
      },
      {
        pattern: /presión (alta|baja|arterial)/gi,
        context: 'vital_signs',
        correction: (match) => match.toLowerCase()
      },
      {
        pattern: /análisis de (sangre|orina|heces)/gi,
        context: 'procedure',
        correction: (match) => match.toLowerCase()
      },
      {
        pattern: /medicamento para (la|el) (.+)/gi,
        context: 'treatment',
        correction: (match) => match.toLowerCase()
      },
      {
        pattern: /dolor en (el|la) (.+)/gi,
        context: 'symptom_location',
        correction: (match) => match.toLowerCase()
      }
    ];
  }

  /**
   * Load common transcription errors
   */
  async loadCommonErrors() {
    return [
      // Pronunciation-based errors
      { wrong: 'hipertensión', correct: 'hipertensión' },
      { wrong: 'diabetis', correct: 'diabetes' },
      { wrong: 'neumonia', correct: 'neumonía' },
      { wrong: 'antibiotico', correct: 'antibiótico' },
      { wrong: 'analgesico', correct: 'analgésico' },
      
      // Accent mark errors
      { wrong: 'migraña', correct: 'migraña' },
      { wrong: 'cefalea', correct: 'cefalea' },
      { wrong: 'nauseas', correct: 'náuseas' },
      { wrong: 'diarrea', correct: 'diarrea' },
      { wrong: 'fiebre', correct: 'fiebre' },
      
      // Common medical term confusions
      { wrong: 'pulmonia', correct: 'neumonía' },
      { wrong: 'gastritis crónica', correct: 'gastritis crónica' },
      { wrong: 'artritis reumatoide', correct: 'artritis reumatoide' },
      { wrong: 'presión alta', correct: 'hipertensión' },
      { wrong: 'azúcar alta', correct: 'diabetes' },
      
      // Medication name errors
      { wrong: 'paracetamol', correct: 'paracetamol' },
      { wrong: 'ibuprofeno', correct: 'ibuprofeno' },
      { wrong: 'aspirina', correct: 'aspirina' },
      { wrong: 'amoxicilina', correct: 'amoxicilina' },
      { wrong: 'omeprazol', correct: 'omeprazol' }
    ];
  }

  /**
   * Extract medical terms from text
   */
  async extractTerms(text, _language = 'es-MX') {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const terms = [];
    const normalizedText = text.toLowerCase();

    // Extract terms from all categories
    for (const category of Object.values(this.medicalDictionary)) {
      for (const termData of category) {
        const allVariants = [termData.term, ...termData.variants];
        
        for (const variant of allVariants) {
          const regex = new RegExp(`\\b${variant}\\b`, 'gi');
          const matches = normalizedText.match(regex);
          
          if (matches) {
            terms.push({
              term: termData.term,
              definition: `Término médico: ${termData.term}`,
              category: termData.category,
              confidence: 0.9,
              synonyms: termData.variants,
              foundAs: variant,
              occurrences: matches.length
            });
          }
        }
      }
    }

    // Remove duplicates and sort by confidence
    const uniqueTerms = this.removeDuplicateTerms(terms);
    return uniqueTerms.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Enhance text with medical terminology corrections
   */
  async enhanceText(text, _language = 'es-MX') {
    if (!this.isInitialized) {
      await this.initialize();
    }

    let enhancedText = text;

    // Apply common error corrections
    if (this.config.enableSpellCheck) {
      enhancedText = this.correctCommonErrors(enhancedText);
    }

    // Apply contextual corrections
    if (this.config.enableContextualCorrection) {
      enhancedText = this.applyContextualCorrections(enhancedText);
    }

    // Standardize medical terms
    enhancedText = this.standardizeMedicalTerms(enhancedText);

    return enhancedText.trim();
  }

  /**
   * Correct common transcription errors
   */
  correctCommonErrors(text) {
    let correctedText = text;

    for (const error of this.commonErrors) {
      const regex = new RegExp(`\\b${error.wrong}\\b`, 'gi');
      correctedText = correctedText.replace(regex, error.correct);
    }

    return correctedText;
  }

  /**
   * Apply contextual corrections
   */
  applyContextualCorrections(text) {
    let correctedText = text;

    for (const rule of this.contextualRules) {
      correctedText = correctedText.replace(rule.pattern, rule.correction);
    }

    return correctedText;
  }

  /**
   * Standardize medical terms
   */
  standardizeMedicalTerms(text) {
    let standardizedText = text;

    // Standardize common medical expressions
    const standardizations = [
      { pattern: /dolor de cabeza/gi, replacement: 'cefalea' },
      { pattern: /presión alta/gi, replacement: 'hipertensión' },
      { pattern: /azúcar alta/gi, replacement: 'diabetes' },
      { pattern: /falta de aire/gi, replacement: 'disnea' },
      { pattern: /dolor de estómago/gi, replacement: 'dolor abdominal' },
      { pattern: /dolor de pecho/gi, replacement: 'dolor torácico' },
      { pattern: /dificultad para respirar/gi, replacement: 'disnea' },
      { pattern: /ganas de vomitar/gi, replacement: 'náuseas' },
      { pattern: /corazón acelerado/gi, replacement: 'taquicardia' },
      { pattern: /ojos amarillos/gi, replacement: 'ictericia' }
    ];

    for (const std of standardizations) {
      standardizedText = standardizedText.replace(std.pattern, std.replacement);
    }

    return standardizedText;
  }

  /**
   * Remove duplicate terms
   */
  removeDuplicateTerms(terms) {
    const seen = new Set();
    const unique = [];

    for (const term of terms) {
      const key = `${term.term}-${term.category}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(term);
      }
    }

    return unique;
  }

  /**
   * Validate medical context
   */
  validateMedicalContext(text) {
    const medicalIndicators = [
      'doctor', 'médico', 'paciente', 'consulta', 'síntoma', 'diagnóstico',
      'tratamiento', 'medicamento', 'dolor', 'fiebre', 'análisis', 'examen'
    ];

    const normalizedText = text.toLowerCase();
    const foundIndicators = medicalIndicators.filter(indicator => 
      normalizedText.includes(indicator)
    );

    return {
      isMedical: foundIndicators.length >= 2,
      confidence: foundIndicators.length / medicalIndicators.length,
      indicators: foundIndicators
    };
  }

  /**
   * Get medical term suggestions
   */
  getMedicalTermSuggestions(partialTerm, maxSuggestions = 5) {
    if (!this.isInitialized) return [];

    const suggestions = [];
    const normalizedInput = partialTerm.toLowerCase();

    for (const category of Object.values(this.medicalDictionary)) {
      for (const termData of category) {
        const allVariants = [termData.term, ...termData.variants];
        
        for (const variant of allVariants) {
          if (variant.toLowerCase().includes(normalizedInput)) {
            suggestions.push({
              term: termData.term,
              category: termData.category,
              variant: variant,
              confidence: this.calculateSimilarity(normalizedInput, variant.toLowerCase())
            });
          }
        }
      }
    }

    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxSuggestions);
  }

  /**
   * Calculate similarity between strings
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Get enhancement statistics
   */
  getEnhancementStats(originalText, enhancedText) {
    const originalTerms = this.extractTerms(originalText);
    const enhancedTerms = this.extractTerms(enhancedText);

    return {
      originalLength: originalText.length,
      enhancedLength: enhancedText.length,
      originalTermsCount: originalTerms.length,
      enhancedTermsCount: enhancedTerms.length,
      improvement: enhancedTerms.length - originalTerms.length,
      confidence: enhancedTerms.reduce((sum, term) => sum + term.confidence, 0) / enhancedTerms.length || 0
    };
  }

  /**
   * Cleanup enhancer
   */
  async cleanup() {
    this.medicalDictionary = null;
    this.contextualRules = null;
    this.commonErrors = null;
    this.isInitialized = false;
    
    console.log('MedicalTerminologyEnhancer cleanup completed');
  }
}

export default MedicalTerminologyEnhancer;