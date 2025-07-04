import { getAllPatients, createPatient, updatePatient, getPatientById, deletePatient } from '../../../prisma/patientsClient';

export async function fetchPatients() {
  return await getAllPatients();
}

export async function savePatient(data) {
  const { id, name, email, phone } = data;
  const existing = await getPatientById(id);
  if (existing) {
    const patient = await updatePatient(id, { name, email, phone });
    return { patient, created: false };
  }
  const patient = await createPatient({ id, name, email, phone });
  return { patient, created: true };
}

export async function removePatient(id) {
  return await deletePatient(id);
}
