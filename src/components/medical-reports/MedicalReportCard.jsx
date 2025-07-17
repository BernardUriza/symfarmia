import React from 'react';
import ReportStatusBadge from './ReportStatusBadge';

export default function MedicalReportCard({ report }) {
  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{report.title}</h3>
        <ReportStatusBadge status={report.status} />
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{report.patient.name}</div>
      <div className="text-sm">{new Date(report.date).toLocaleDateString()}</div>
    </div>
  );
}
