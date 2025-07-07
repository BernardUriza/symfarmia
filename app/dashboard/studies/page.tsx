import ModelManager from '@/components/ModelManager';
export default function StudiesPage() {
  return <ModelManager endpoint="/api/studies" fields={["medicalReportId","studyTypeId","name"]} title="Studies" />;
}
