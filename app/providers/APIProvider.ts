export abstract class APIProvider {
  async fetchPatients(): Promise<unknown> {
    throw new Error('fetchPatients must be implemented');
  }

  async savePatient(_patient: unknown): Promise<unknown> {
    throw new Error('savePatient must be implemented');
  }

  async removePatient(_patientId: number | string): Promise<unknown> {
    throw new Error('removePatient must be implemented');
  }

  async fetchMedicalReports(): Promise<unknown> {
    throw new Error('fetchMedicalReports must be implemented');
  }

  async fetchMedicalReport(_reportId: number | string): Promise<unknown> {
    throw new Error('fetchMedicalReport must be implemented');
  }

  async saveMedicalReport(_report: unknown): Promise<unknown> {
    throw new Error('saveMedicalReport must be implemented');
  }

  async removeMedicalReport(_reportId: number | string): Promise<unknown> {
    throw new Error('removeMedicalReport must be implemented');
  }

  async fetchCategories(): Promise<unknown> {
    throw new Error('fetchCategories must be implemented');
  }

  async saveCategory(_category: unknown): Promise<unknown> {
    throw new Error('saveCategory must be implemented');
  }

  async fetchStudyTypes(): Promise<unknown> {
    throw new Error('fetchStudyTypes must be implemented');
  }

  async saveStudyType(_studyType: unknown): Promise<unknown> {
    throw new Error('saveStudyType must be implemented');
  }

  async saveStudy(_study: unknown): Promise<unknown> {
    throw new Error('saveStudy must be implemented');
  }

  async removeStudy(_studyId: number | string): Promise<unknown> {
    throw new Error('removeStudy must be implemented');
  }

  async sendTokenByEmail(_emailData: unknown): Promise<unknown> {
    throw new Error('sendTokenByEmail must be implemented');
  }

  async mergePdfs(_pdfData: unknown): Promise<unknown> {
    throw new Error('mergePdfs must be implemented');
  }
}