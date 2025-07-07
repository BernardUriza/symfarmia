/**
 * Medical Specialty Service
 * 
 * Specialized medical AI support for vulnerable populations and complex conditions.
 * Focuses on HIV management, pregnancy care, adolescent health, and quality of life.
 */

import { MedicalAIConfig } from '../config/MedicalAIConfig.js';

export class MedicalSpecialtyService {
  
  /**
   * HIV + Pregnant Adolescents Medical Loop
   * Addresses critical care for this vulnerable population
   */
  static async hivPregnantAdolescentsLoop(patientContext) {
    const specializedQueries = [
      // HIV Management During Pregnancy
      `Manejo de VIH en adolescente embarazada de ${patientContext.age || '16'} años: [MASK] antirretroviral seguro`,
      `Profilaxis madre-hijo VIH en embarazo adolescente: riesgo de transmisión [MASK]`,
      `Monitoreo carga viral VIH embarazo adolescente: frecuencia controles [MASK]`,
      
      // Pregnancy Care for HIV+ Adolescents
      `Embarazo adolescente VIH positivo: suplementación nutricional [MASK] esencial`,
      `Parto VIH positivo adolescente: vía de nacimiento recomendada [MASK]`,
      `Lactancia materna VIH adolescente: recomendación alimentación [MASK]`,
      
      // Adolescent-Specific Considerations
      `Adherencia tratamiento VIH adolescente embarazada: estrategias [MASK] efectivas`,
      `Salud mental VIH embarazo adolescente: apoyo psicológico [MASK]`,
      `Educación sexual VIH adolescente: prevención futuras [MASK]`,
      
      // Quality of Life Factors
      `Calidad de vida VIH embarazo adolescente: factores [MASK] importantes`,
      `Dieta embarazo VIH adolescente: requerimientos nutricionales [MASK]`,
      `Ejercicio seguro embarazo VIH adolescente: actividades [MASK] recomendadas`
    ];

    const responses = [];
    
    for (const query of specializedQueries) {
      try {
        const response = await fetch('/api/medical', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            context: {
              ...patientContext,
              specialty: 'hiv_pregnancy_adolescent',
              vulnerability: 'high',
              priority: 'urgent'
            },
            type: 'diagnosis'
          })
        });

        if (response.ok) {
          const result = await response.json();
          responses.push({
            query: query.replace('[MASK]', '_____'),
            response: result.response,
            confidence: result.confidence,
            category: this._categorizeQuery(query)
          });
        }
      } catch (error) {
        console.error('Error in HIV pregnancy adolescent query:', error);
      }
    }

    return {
      population: 'HIV+ Pregnant Adolescents',
      totalQueries: specializedQueries.length,
      responses,
      summary: this._generateSummary(responses),
      recommendations: this._generateSpecializedRecommendations(responses),
      urgency: 'HIGH',
      vulnerability: 'CRITICAL',
      disclaimer: MedicalAIConfig.getDisclaimer()
    };
  }

  /**
   * Quality of Life Medical Loop
   * For patients with poor quality of life, health, and diet
   */
  static async qualityOfLifeLoop(patientContext) {
    const lifeQualityQueries = [
      // Nutritional Assessment
      `Paciente baja calidad vida: deficiencias nutricionales [MASK] comunes`,
      `Dieta inadecuada adulto: suplementos vitamínicos [MASK] esenciales`,
      `Malnutrición calidad vida: intervención nutricional [MASK] prioritaria`,
      
      // Physical Health Assessment
      `Baja calidad vida salud: evaluación médica [MASK] integral`,
      `Deterioro físico calidad vida: ejercicio terapéutico [MASK] apropiado`,
      `Fatiga crónica baja calidad: causas médicas [MASK] investigar`,
      
      // Mental Health and Social Support
      `Depresión baja calidad vida: tratamiento [MASK] multidisciplinario`,
      `Aislamiento social calidad vida: apoyo comunitario [MASK] necesario`,
      `Estrés crónico baja calidad: técnicas manejo [MASK] efectivas`,
      
      // Preventive Care
      `Medicina preventiva baja calidad vida: screening [MASK] prioritario`,
      `Vacunación adulto vulnerable: esquema [MASK] recomendado`,
      `Control enfermedades crónicas: frecuencia seguimiento [MASK]`
    ];

    const responses = [];
    
    for (const query of lifeQualityQueries) {
      try {
        const response = await fetch('/api/medical', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            context: {
              ...patientContext,
              specialty: 'quality_of_life',
              socioeconomic: 'vulnerable',
              priority: 'high'
            },
            type: 'diagnosis'
          })
        });

        if (response.ok) {
          const result = await response.json();
          responses.push({
            query: query.replace('[MASK]', '_____'),
            response: result.response,
            confidence: result.confidence,
            category: this._categorizeQualityOfLifeQuery(query)
          });
        }
      } catch (error) {
        console.error('Error in quality of life query:', error);
      }
    }

    return {
      population: 'Patients with Poor Quality of Life',
      totalQueries: lifeQualityQueries.length,
      responses,
      summary: this._generateQualityOfLifeSummary(responses),
      recommendations: this._generateQualityOfLifeRecommendations(responses),
      priority: 'HIGH',
      focus: 'HOLISTIC_CARE',
      disclaimer: MedicalAIConfig.getDisclaimer()
    };
  }

  /**
   * Comprehensive Vulnerable Populations Loop
   * Combines multiple specialty areas for complex cases
   */
  static async comprehensiveVulnerableLoop(patientContext) {
    const hivPregnancy = await this.hivPregnantAdolescentsLoop(patientContext);
    const qualityOfLife = await this.qualityOfLifeLoop(patientContext);

    return {
      comprehensive: true,
      populations: ['HIV+ Pregnant Adolescents', 'Poor Quality of Life'],
      hivPregnancyResults: hivPregnancy,
      qualityOfLifeResults: qualityOfLife,
      combinedRecommendations: this._generateCombinedRecommendations(hivPregnancy, qualityOfLife),
      overallPriority: 'CRITICAL',
      disclaimer: MedicalAIConfig.getDisclaimer()
    };
  }

  // Helper methods for categorization and analysis
  static _categorizeQuery(query) {
    if (query.includes('antirretroviral') || query.includes('carga viral')) return 'HIV_MANAGEMENT';
    if (query.includes('embarazo') || query.includes('parto')) return 'PREGNANCY_CARE';
    if (query.includes('adolescente') || query.includes('adherencia')) return 'ADOLESCENT_CARE';
    if (query.includes('calidad vida') || query.includes('dieta')) return 'QUALITY_OF_LIFE';
    return 'GENERAL';
  }

  static _categorizeQualityOfLifeQuery(query) {
    if (query.includes('nutricional') || query.includes('dieta')) return 'NUTRITION';
    if (query.includes('ejercicio') || query.includes('físico')) return 'PHYSICAL_HEALTH';
    if (query.includes('depresión') || query.includes('estrés')) return 'MENTAL_HEALTH';
    if (query.includes('preventiva') || query.includes('screening')) return 'PREVENTIVE_CARE';
    return 'GENERAL';
  }

  static _generateSummary(responses) {
    const categories = responses.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {});

    const avgConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;

    return {
      totalResponses: responses.length,
      averageConfidence: Math.round(avgConfidence * 100) / 100,
      categoriesAddressed: Object.keys(categories),
      categoryBreakdown: categories
    };
  }

  static _generateQualityOfLifeSummary(responses) {
    return this._generateSummary(responses);
  }

  static _generateSpecializedRecommendations(_responses) {
    return [
      'Establecer equipo multidisciplinario: infectólogo, obstetra, pediatra',
      'Monitoreo carga viral VIH cada 4 semanas durante embarazo',
      'Suplementación nutricional específica para embarazo adolescente',
      'Apoyo psicológico continuo para adherencia al tratamiento',
      'Educación sobre prevención de transmisión vertical',
      'Planificación del parto en centro especializado',
      'Seguimiento pediátrico inmediato post-parto',
      'Consejería en planificación familiar post-parto'
    ];
  }

  static _generateQualityOfLifeRecommendations(_responses) {
    return [
      'Evaluación nutricional completa y plan alimentario personalizado',
      'Screening de enfermedades crónicas y deficiencias vitamínicas',
      'Programa de ejercicio adaptado a capacidades físicas',
      'Valoración de salud mental y apoyo psicológico',
      'Conectar con recursos comunitarios y apoyo social',
      'Implementar medicina preventiva según edad y factores de riesgo',
      'Educación en autocuidado y estilos de vida saludables',
      'Seguimiento médico regular y coordinado'
    ];
  }

  static _generateCombinedRecommendations(_hivPregnancy, _qualityOfLife) {
    return [
      'PRIORIDAD CRÍTICA: Atención multidisciplinaria inmediata',
      'Coordinación entre infectología, obstetricia y medicina interna',
      'Evaluación integral: VIH, embarazo, nutrición y salud mental',
      'Apoyo psicosocial intensivo para adherencia y calidad de vida',
      'Intervención nutricional especializada para embarazo VIH+',
      'Monitoreo estrecho de complicaciones y efectos adversos',
      'Preparación para parto seguro con profilaxis antirretroviral',
      'Plan de seguimiento a largo plazo madre-hijo'
    ];
  }

  /**
   * API endpoint for testing specialty services
   */
  static async testEndpoint(specialty, patientContext) {
    switch (specialty) {
      case 'hiv_pregnancy_adolescent':
        return await this.hivPregnantAdolescentsLoop(patientContext);
      case 'quality_of_life':
        return await this.qualityOfLifeLoop(patientContext);
      case 'comprehensive':
        return await this.comprehensiveVulnerableLoop(patientContext);
      default:
        throw new Error(`Unsupported specialty: ${specialty}`);
    }
  }
}

export default MedicalSpecialtyService;