// useCases/index.js

// Import individual use cases
import { fetchMedicalReports } from './fetchMedicalReports';
import { fetchPatients } from './fetchPatients';
import { saveMedicalReports } from './saveMedicalReport';
import { savePatient } from './savePatient';
import { fetchCategories } from './fetchCategories';
import { saveStudy } from './saveStudy';
import { removeStudy } from './removeStudy';

// Export all use cases from a single point
export {
  fetchMedicalReports,
  fetchPatients,
  saveMedicalReports,
  savePatient,
  fetchCategories,
  saveStudy,
  removeStudy
};
