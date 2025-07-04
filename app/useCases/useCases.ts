import { useAppMode } from '../providers/AppModeProvider';
import Patient from '../../legacy_core/app/entities/Patient';

export function useUseCases() {
  const { apiProvider } = useAppMode();

  const fetchPatients = async () => {
    try {
      const data = await apiProvider.fetchPatients();
      return data.map((patient) => new Patient(patient));
    } catch (error) {
      throw new Error('Error fetching patients: ' + error.message);
    }
  };

  const savePatient = async (editedPatient) => {
    try {
      return await apiProvider.savePatient(editedPatient);
    } catch (error) {
      throw error;
    }
  };

  const removePatient = async (patientId) => {
    try {
      return await apiProvider.removePatient(patientId);
    } catch (error) {
      throw error;
    }
  };

  const fetchMedicalReports = async () => {
    try {
      return await apiProvider.fetchMedicalReports();
    } catch (error) {
      throw new Error('Error fetching medical reports: ' + error.message);
    }
  };

  const fetchMedicalReport = async (reportId) => {
    try {
      return await apiProvider.fetchMedicalReport(reportId);
    } catch (error) {
      throw new Error('Error fetching medical report: ' + error.message);
    }
  };

  const saveMedicalReport = async (report) => {
    try {
      return await apiProvider.saveMedicalReport(report);
    } catch (error) {
      throw error;
    }
  };

  const removeMedicalReport = async (reportId) => {
    try {
      return await apiProvider.removeMedicalReport(reportId);
    } catch (error) {
      throw error;
    }
  };

  const fetchCategories = async () => {
    try {
      return await apiProvider.fetchCategories();
    } catch (error) {
      throw new Error('Error fetching categories: ' + error.message);
    }
  };

  const saveCategory = async (category) => {
    try {
      return await apiProvider.saveCategory(category);
    } catch (error) {
      throw error;
    }
  };

  const fetchStudyTypes = async () => {
    try {
      return await apiProvider.fetchStudyTypes();
    } catch (error) {
      throw new Error('Error fetching study types: ' + error.message);
    }
  };

  const saveStudyType = async (studyType) => {
    try {
      return await apiProvider.saveStudyType(studyType);
    } catch (error) {
      throw error;
    }
  };

  const saveStudy = async (study) => {
    try {
      return await apiProvider.saveStudy(study);
    } catch (error) {
      throw error;
    }
  };

  const removeStudy = async (studyId) => {
    try {
      return await apiProvider.removeStudy(studyId);
    } catch (error) {
      throw error;
    }
  };

  const sendTokenByEmail = async (emailData) => {
    try {
      return await apiProvider.sendTokenByEmail(emailData);
    } catch (error) {
      throw error;
    }
  };

  const mergePdfs = async (pdfData) => {
    try {
      return await apiProvider.mergePdfs(pdfData);
    } catch (error) {
      throw error;
    }
  };

  return {
    fetchPatients,
    savePatient,
    removePatient,
    fetchMedicalReports,
    fetchMedicalReport,
    saveMedicalReport,
    removeMedicalReport,
    fetchCategories,
    saveCategory,
    fetchStudyTypes,
    saveStudyType,
    saveStudy,
    removeStudy,
    sendTokenByEmail,
    mergePdfs
  };
}