import ModelManager from '@/components/ModelManager';
export default function MedicalReportsPage() {
  return <ModelManager endpoint="/api/medicalReports" fields={["patientId","diagnosis","status"]} title="Medical Reports" />;
}
