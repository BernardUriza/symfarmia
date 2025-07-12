import { useI18n } from '@/domains/core';

export function useMedicalTranslation(ns = 'medical') {
  const { t, locale } = useI18n();
  const translateMedicalTerm = (key) => t(`medical.${key}`);
  return { t, i18n: { language: locale }, translateMedicalTerm };
}

export default useMedicalTranslation;
