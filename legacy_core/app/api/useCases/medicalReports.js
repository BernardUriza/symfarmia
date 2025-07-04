import { getAllMedicalReports, createMedicalReport, updateMedicalReport, getMedicalReportById, deleteMedicalReport } from '../../../prisma/medicalReportsClient';

export async function fetchMedicalReports() {
  return await getAllMedicalReports();
}

export async function fetchMedicalReport(id) {
  return await getMedicalReportById(id);
}

export async function saveMedicalReport(data) {
  const { id, ...rest } = data;
  const existing = id ? await getMedicalReportById(id) : null;
  if (existing) {
    const report = await updateMedicalReport(id, rest);
    return { report, created: false };
  }
  const report = await createMedicalReport(rest);
  return { report, created: true };
}

export async function removeMedicalReport(id) {
  return await deleteMedicalReport(id);
}
