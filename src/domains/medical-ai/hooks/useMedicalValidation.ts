import { useState } from 'react';
import { medicalValidationService } from '../services/medicalValidationService';

export const useMedicalValidation = () => {
  const [valid, setValid] = useState<boolean | null>(null);

  const validate = async (text: string) => {
    const result = await medicalValidationService.validate(text);
    setValid(result);
    return result;
  };

  return { valid, validate };
};

export default useMedicalValidation;
