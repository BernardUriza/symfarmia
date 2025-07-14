import ModelManager, { FieldDef } from '@/src/components/medical/ModelManager';
import { GENDER, DOCUMENT_TYPE, BLOOD_TYPE } from '@/types/constants';

const fields: FieldDef[] = [
  { name: 'name' },
  { name: 'email' },
  { name: 'phone' },
  { name: 'information' },
  { name: 'dateOfBirth', type: 'date' },
  { name: 'gender', type: 'select', options: Object.values(GENDER) },
  { name: 'status' },
  { name: 'firstName' },
  { name: 'lastName' },
  { name: 'documentType', type: 'select', options: Object.values(DOCUMENT_TYPE) },
  { name: 'documentNumber' },
  { name: 'address' },
  { name: 'bloodType', type: 'select', options: Object.values(BLOOD_TYPE) },
  { name: 'allergies' },
  { name: 'chronicConditions' },
  { name: 'emergencyContactName' },
  { name: 'emergencyContactRelationship' },
  { name: 'emergencyContactPhone' },
  { name: 'avatarUrl' },
  { name: 'isActive', type: 'checkbox' },
];

export default function PatientsPage() {
  return <ModelManager endpoint="/api/patients" fields={fields} title="Patients" />;
}
