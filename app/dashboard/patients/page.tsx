import ModelManager from '@/components/ModelManager';
export default function PatientsPage() {
  return <ModelManager endpoint="/api/patients" fields={["name","email","phone"]} title="Patients" />;
}
