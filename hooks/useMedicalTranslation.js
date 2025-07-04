import { useTranslation } from 'next-i18next';

export default function useMedicalTranslation(ns = 'medical') {
  const { t, i18n } = useTranslation(ns);
  const translateMedicalTerm = (key) => t(key, { ns: 'medical' });
  return { t, i18n, translateMedicalTerm };
}
