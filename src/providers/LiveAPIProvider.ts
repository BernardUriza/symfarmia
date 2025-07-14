import { APIProvider } from './APIProvider';
import type { Database } from '@/app/infrastructure/database';
import type {
  APIResponse,
  Category,
  EmailData,
  MedicalReport,
  MergePdfData,
  MergePdfResult,
  Patient,
  Study,
  StudyType
} from '@/types/providers';

export class LiveAPIProvider extends APIProvider {
  constructor(db?: Database) {
    super(db);
  }

  async fetchPatients(): Promise<Patient[]> {
    try {
      const response = await fetch('/api/patients');
      if (response.ok) {
        return (await response.json()) as Patient[];
      }
      throw new Error('Error fetching patients');
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error('Error fetching patients: ' + error.message);
      }
      throw error;
    }
  }

  async savePatient(patient: Partial<Patient>): Promise<APIResponse<boolean>> {
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patient),
      });

      if (response.ok) {
        return { success: true, data: true };
      }
      return { success: false, data: false };
    } catch (error: unknown) {
      throw error;
    }
  }

  async removePatient(patientId: number): Promise<APIResponse<boolean>> {
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        return { success: true, data: true };
      }
      return { success: false, data: false };
    } catch (error: unknown) {
      throw error;
    }
  }

  async fetchMedicalReports(): Promise<MedicalReport[]> {
    try {
      const response = await fetch('/api/medicalReports');
      if (response.ok) {
        return (await response.json()) as MedicalReport[];
      }
      throw new Error('Error fetching medical reports');
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error('Error fetching medical reports: ' + error.message);
      }
      throw error;
    }
  }

  async fetchMedicalReport(reportId: number): Promise<MedicalReport> {
    try {
      const response = await fetch(`/api/medicalReports/${reportId}`);
      if (response.ok) {
        return (await response.json()) as MedicalReport;
      }
      throw new Error('Error fetching medical report');
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error('Error fetching medical report: ' + error.message);
      }
      throw error;
    }
  }

  async saveMedicalReport(report: Partial<MedicalReport>): Promise<APIResponse<boolean>> {
    try {
      const response = await fetch('/api/medicalReports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      if (response.ok) {
        return { success: true, data: true };
      }
      return { success: false, data: false };
    } catch (error: unknown) {
      throw error;
    }
  }

  async removeMedicalReport(reportId: number): Promise<APIResponse<boolean>> {
    try {
      const response = await fetch(`/api/medicalReports/${reportId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        return { success: true, data: true };
      }
      return { success: false, data: false };
    } catch (error: unknown) {
      throw error;
    }
  }

  async fetchCategories(): Promise<Category[]> {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        return (await response.json()) as Category[];
      }
      throw new Error('Error fetching categories');
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error('Error fetching categories: ' + error.message);
      }
      throw error;
    }
  }

  async saveCategory(category: Partial<Category>): Promise<APIResponse<boolean>> {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      });

      if (response.ok) {
        return { success: true, data: true };
      }
      return { success: false, data: false };
    } catch (error: unknown) {
      throw error;
    }
  }

  async fetchStudyTypes(): Promise<StudyType[]> {
    try {
      const response = await fetch('/api/study-types');
      if (response.ok) {
        return (await response.json()) as StudyType[];
      }
      throw new Error('Error fetching study types');
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error('Error fetching study types: ' + error.message);
      }
      throw error;
    }
  }

  async fetchStudies(): Promise<Study[]> {
    try {
      const response = await fetch('/api/studies');
      if (response.ok) {
        return (await response.json()) as Study[];
      }
      throw new Error('Error fetching studies');
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error('Error fetching studies: ' + error.message);
      }
      throw error;
    }
  }

  async saveStudyType(studyType: Partial<StudyType>): Promise<APIResponse<boolean>> {
    try {
      const response = await fetch('/api/study-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studyType),
      });

      if (response.ok) {
        return { success: true, data: true };
      }
      return { success: false, data: false };
    } catch (error: unknown) {
      throw error;
    }
  }

  async saveStudy(study: Partial<Study>): Promise<APIResponse<boolean>> {
    try {
      const response = await fetch('/api/studies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(study),
      });

      if (response.ok) {
        return { success: true, data: true };
      }
      return { success: false, data: false };
    } catch (error: unknown) {
      throw error;
    }
  }

  async removeStudy(studyId: number): Promise<APIResponse<boolean>> {
    try {
      const response = await fetch(`/api/studies/${studyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        return { success: true, data: true };
      }
      return { success: false, data: false };
    } catch (error: unknown) {
      throw error;
    }
  }

  async sendTokenByEmail(emailData: EmailData): Promise<APIResponse<boolean>> {
    try {
      const response = await fetch('/api/mailerHelper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        return { success: true, data: true };
      }
      return { success: false, data: false };
    } catch (error: unknown) {
      throw error;
    }
  }

  async mergePdfs(pdfData: MergePdfData): Promise<MergePdfResult> {
    try {
      const response = await fetch('/api/mergePdfs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pdfData),
      });

      if (response.ok) {
        return (await response.json()) as MergePdfResult;
      }
      return { success: false, url: '', message: 'Error merging PDFs' };
    } catch (error: unknown) {
      throw error;
    }
  }
}