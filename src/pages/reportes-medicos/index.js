import React from 'react';
import MedicalReportList from '../../components/medical-reports/MedicalReportList';
import { useTranslation } from '../../../app/providers/I18nProvider';

export default function ReportesMedicosPage() {
  const { t } = useTranslation();
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t('medical_reports_management')}</h1>
      <MedicalReportList />
    </div>
  );
}
