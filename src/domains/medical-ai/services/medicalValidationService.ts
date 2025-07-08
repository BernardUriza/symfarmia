export class MedicalValidationService {
  async validate(text: string): Promise<boolean> {
    // Very basic placeholder validation
    return text.length > 0;
  }
}

export const medicalValidationService = new MedicalValidationService();
