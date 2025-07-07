import { useAppMode } from '../providers/AppModeProvider';
import Patient from '../domain/entities/Patient';
import type { 
  Patient as PatientData, 
  MedicalReport, 
  Category, 
  StudyType, 
  Study, 
  EmailData, 
  MergePdfData,
  MergePdfResult,
  APIResponse 
} from '../../types/providers';

export function useUseCases() {
  const { apiProvider } = useAppMode();

  const fetchPatients = async (): Promise<Patient[]> => {
    try {
      const data = await apiProvider!.fetchPatients();
      return data.map((patient: PatientData) => new Patient({
        id: patient.id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        information: patient.medicalHistory || '',
        dateOfBirth: new Date(patient.dateOfBirth),
        gender: 'no especificado',
        status: 'active'
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error('Error fetching patients: ' + errorMessage);
    }
  };

  const savePatient = async (editedPatient: Partial<PatientData>): Promise<APIResponse<boolean>> => {
    try {
      return await apiProvider!.savePatient(editedPatient);
    } catch (error: unknown) {
      throw error;
    }
  };

  const removePatient = async (patientId: number): Promise<APIResponse<boolean>> => {
    try {
      return await apiProvider!.removePatient(patientId);
    } catch (error: unknown) {
      throw error;
    }
  };

  const fetchMedicalReports = async (): Promise<MedicalReport[]> => {
    try {
      return await apiProvider!.fetchMedicalReports();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error('Error fetching medical reports: ' + errorMessage);
    }
  };

  const fetchMedicalReport = async (reportId: number): Promise<MedicalReport | null> => {
    try {
      return await apiProvider!.fetchMedicalReport(reportId);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error('Error fetching medical report: ' + errorMessage);
    }
  };

  const saveMedicalReport = async (report: Partial<MedicalReport>): Promise<APIResponse<boolean>> => {
    try {
      return await apiProvider!.saveMedicalReport(report);
    } catch (error: unknown) {
      throw error;
    }
  };

  const removeMedicalReport = async (reportId: number): Promise<APIResponse<boolean>> => {
    try {
      return await apiProvider!.removeMedicalReport(reportId);
    } catch (error: unknown) {
      throw error;
    }
  };

  const fetchCategories = async (): Promise<Category[]> => {
    try {
      return await apiProvider!.fetchCategories();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error('Error fetching categories: ' + errorMessage);
    }
  };

  const saveCategory = async (category: Partial<Category>): Promise<APIResponse<boolean>> => {
    try {
      return await apiProvider!.saveCategory(category);
    } catch (error: unknown) {
      throw error;
    }
  };

  const fetchStudyTypes = async (): Promise<StudyType[]> => {
    try {
      return await apiProvider!.fetchStudyTypes();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error('Error fetching study types: ' + errorMessage);
    }
  };

  const saveStudyType = async (studyType: Partial<StudyType>): Promise<APIResponse<boolean>> => {
    try {
      return await apiProvider!.saveStudyType(studyType);
    } catch (error: unknown) {
      throw error;
    }
  };

  const fetchStudies = async (): Promise<Study[]> => {
    try {
      return await apiProvider!.fetchStudies();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error('Error fetching studies: ' + errorMessage);
    }
  };

  const saveStudy = async (study: Partial<Study>): Promise<APIResponse<boolean>> => {
    try {
      return await apiProvider!.saveStudy(study);
    } catch (error: unknown) {
      throw error;
    }
  };

  const removeStudy = async (studyId: number): Promise<APIResponse<boolean>> => {
    try {
      return await apiProvider!.removeStudy(studyId);
    } catch (error: unknown) {
      throw error;
    }
  };

  const sendTokenByEmail = async (emailData: EmailData): Promise<APIResponse<boolean>> => {
    try {
      return await apiProvider!.sendTokenByEmail(emailData);
    } catch (error: unknown) {
      throw error;
    }
  };

  const mergePdfs = async (pdfData: MergePdfData): Promise<MergePdfResult> => {
    try {
      return await apiProvider!.mergePdfs(pdfData);
    } catch (error: unknown) {
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
    fetchStudies,
    saveStudy,
    removeStudy,
    sendTokenByEmail,
    mergePdfs
  };
}