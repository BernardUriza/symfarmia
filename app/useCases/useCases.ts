import { useAppMode } from '../providers/AppModeProvider';
import Patient from '../domain/entities/Patient';

export function useUseCases() {
  const { apiProvider } = useAppMode();

  const fetchPatients = async () => {
    try {
      const data = await apiProvider!.fetchPatients();
      return data.map((patient: any) => new Patient(patient));
    } catch (error: any) {
      throw new Error('Error fetching patients: ' + error.message);
    }
  };

  const savePatient = async (editedPatient: any) => {
    try {
      return await apiProvider!.savePatient(editedPatient);
    } catch (error: any) {
      throw error;
    }
  };

  const removePatient = async (patientId: any) => {
    try {
      return await apiProvider!.removePatient(patientId);
    } catch (error: any) {
      throw error;
    }
  };

  const fetchMedicalReports = async () => {
    try {
      return await apiProvider!.fetchMedicalReports();
    } catch (error: any) {
      throw new Error('Error fetching medical reports: ' + error.message);
    }
  };

  const fetchMedicalReport = async (reportId: any) => {
    try {
      return await apiProvider!.fetchMedicalReport(reportId);
    } catch (error: any) {
      throw new Error('Error fetching medical report: ' + error.message);
    }
  };

  const saveMedicalReport = async (report: any) => {
    try {
      return await apiProvider!.saveMedicalReport(report);
    } catch (error: any) {
      throw error;
    }
  };

  const removeMedicalReport = async (reportId: any) => {
    try {
      return await apiProvider!.removeMedicalReport(reportId);
    } catch (error: any) {
      throw error;
    }
  };

  const fetchCategories = async () => {
    try {
      return await apiProvider!.fetchCategories();
    } catch (error: any) {
      throw new Error('Error fetching categories: ' + error.message);
    }
  };

  const saveCategory = async (category: any) => {
    try {
      return await apiProvider!.saveCategory(category);
    } catch (error: any) {
      throw error;
    }
  };

  const fetchStudyTypes = async () => {
    try {
      return await apiProvider!.fetchStudyTypes();
    } catch (error: any) {
      throw new Error('Error fetching study types: ' + error.message);
    }
  };

  const saveStudyType = async (studyType: any) => {
    try {
      return await apiProvider!.saveStudyType(studyType);
    } catch (error: any) {
      throw error;
    }
  };

  const saveStudy = async (study: any) => {
    try {
      return await apiProvider!.saveStudy(study);
    } catch (error: any) {
      throw error;
    }
  };

  const removeStudy = async (studyId: any) => {
    try {
      return await apiProvider!.removeStudy(studyId);
    } catch (error: any) {
      throw error;
    }
  };

  const sendTokenByEmail = async (emailData: any) => {
    try {
      return await apiProvider!.sendTokenByEmail(emailData);
    } catch (error: any) {
      throw error;
    }
  };

  const mergePdfs = async (pdfData: any) => {
    try {
      return await apiProvider!.mergePdfs(pdfData);
    } catch (error: any) {
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