export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class DemoValidationService {
  static validateTranscription(text: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!text || text.trim().length === 0) {
      errors.push('La transcripción no puede estar vacía');
    }

    if (text.length < 10) {
      warnings.push('La transcripción es muy corta');
    }

    if (text.length > 1000) {
      warnings.push('La transcripción es muy larga');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validatePatientSelection(patientId: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!patientId) {
      errors.push('Debe seleccionar un paciente');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateDemoSettings(settings: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!settings.language) {
      errors.push('El idioma es requerido');
    }

    if (!settings.medicalSpecialty) {
      warnings.push('Se recomienda seleccionar una especialidad médica');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export default DemoValidationService;