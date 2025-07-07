"use client";
import React from 'react';
import { useTranslation } from '../../providers/I18nProvider';

export default function NuevoReportePage() {
  const { t } = useTranslation();
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t('new_medical_report')}</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Funcionalidad de nuevo reporte médico próximamente...</p>
      </div>
    </div>
  );
}