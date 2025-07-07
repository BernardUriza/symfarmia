import React from 'react';
import { mockMedicalReports } from '../../data/mockMedicalReports';
import MedicalReportCard from './MedicalReportCard';

export default function MedicalReportList() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {mockMedicalReports.map((r) => (
        <MedicalReportCard key={r.id} report={r} />
      ))}
    </div>
  );
}
