"use client";
import React from 'react';
import MedicalReportList from '../../src/components/medical-reports/MedicalReportList';
import { useTranslation } from '@/src/providers/I18nProvider';

export default function ReportesMedicosPage() {
  const { t } = useTranslation();
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t('medical_reports_management')}</h1>
      <MedicalReportList />
    </div>
  );
}