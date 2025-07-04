// useCases/fetchMedicalReport.js
import MedicalReport from '../../app/domain/entities/MedicalReport';

export async function fetchMedicalReport(reportId) {
  try {
    const response = await fetch(`/api/medicalReports/${reportId}`);
    if (response.ok) {
      const data = await response.json();
      return new MedicalReport(data);
    } else {
      throw new Error('Error fetching medical report');
    }
  } catch (error) {
    throw new Error('Error fetching medical report: ' + error.message);
  }
}
