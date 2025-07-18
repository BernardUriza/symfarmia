import { ModelManager } from '@/src/components/medical/ModelManager';
export default function StudiesPage() {
  return <ModelManager endpoint="/api/studies" fields={["medicalReportId","studyTypeId","name"]} title="Studies" />;
}
