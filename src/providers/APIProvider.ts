import type {
  Category,
  EmailData,
  MedicalReport,
  MergePdfData,
  MergePdfResult,
  Patient,
  Study,
  StudyType,
  APIResponse
} from '@/types/providers';
import type { Database } from '@/src/infrastructure/database';

export abstract class APIProvider {
  protected readonly db?: Database;

  constructor(db?: Database) {
    if (db !== undefined) {
      this.db = db;
    }
  }

  async fetchPatients(): Promise<Patient[]> {
    throw new Error('fetchPatients must be implemented');
  }

  async savePatient(_patient: Partial<Patient>): Promise<APIResponse<boolean>> {
    throw new Error('savePatient must be implemented');
  }

  async removePatient(_patientId: number): Promise<APIResponse<boolean>> {
    throw new Error('removePatient must be implemented');
  }

  async fetchMedicalReports(): Promise<MedicalReport[]> {
    throw new Error('fetchMedicalReports must be implemented');
  }

  async fetchMedicalReport(_reportId: number): Promise<MedicalReport | null> {
    throw new Error('fetchMedicalReport must be implemented');
  }

  async saveMedicalReport(_report: Partial<MedicalReport>): Promise<APIResponse<boolean>> {
    throw new Error('saveMedicalReport must be implemented');
  }

  async removeMedicalReport(_reportId: number): Promise<APIResponse<boolean>> {
    throw new Error('removeMedicalReport must be implemented');
  }

  async fetchCategories(): Promise<Category[]> {
    throw new Error('fetchCategories must be implemented');
  }

  async saveCategory(_category: Partial<Category>): Promise<APIResponse<boolean>> {
    throw new Error('saveCategory must be implemented');
  }

  async fetchStudyTypes(): Promise<StudyType[]> {
    throw new Error('fetchStudyTypes must be implemented');
  }

  async fetchStudies(): Promise<Study[]> {
    throw new Error('fetchStudies must be implemented');
  }

  async saveStudyType(_studyType: Partial<StudyType>): Promise<APIResponse<boolean>> {
    throw new Error('saveStudyType must be implemented');
  }

  async saveStudy(_study: Partial<Study>): Promise<APIResponse<boolean>> {
    throw new Error('saveStudy must be implemented');
  }

  async removeStudy(_studyId: number): Promise<APIResponse<boolean>> {
    throw new Error('removeStudy must be implemented');
  }

  async sendTokenByEmail(_emailData: EmailData): Promise<APIResponse<boolean>> {
    throw new Error('sendTokenByEmail must be implemented');
  }

  async mergePdfs(_pdfData: MergePdfData): Promise<MergePdfResult> {
    throw new Error('mergePdfs must be implemented');
  }
}