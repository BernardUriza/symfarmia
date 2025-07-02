export class APIProvider {
  async fetchPatients() {
    throw new Error('fetchPatients must be implemented');
  }

  async savePatient(_patient) {
    throw new Error('savePatient must be implemented');
  }

  async removePatient(_patientId) {
    throw new Error('removePatient must be implemented');
  }

  async fetchMedicalReports() {
    throw new Error('fetchMedicalReports must be implemented');
  }

  async fetchMedicalReport(_reportId) {
    throw new Error('fetchMedicalReport must be implemented');
  }

  async saveMedicalReport(_report) {
    throw new Error('saveMedicalReport must be implemented');
  }

  async removeMedicalReport(_reportId) {
    throw new Error('removeMedicalReport must be implemented');
  }

  async fetchCategories() {
    throw new Error('fetchCategories must be implemented');
  }

  async saveCategory(_category) {
    throw new Error('saveCategory must be implemented');
  }

  async fetchStudyTypes() {
    throw new Error('fetchStudyTypes must be implemented');
  }

  async saveStudyType(_studyType) {
    throw new Error('saveStudyType must be implemented');
  }

  async saveStudy(_study) {
    throw new Error('saveStudy must be implemented');
  }

  async removeStudy(_studyId) {
    throw new Error('removeStudy must be implemented');
  }

  async sendTokenByEmail(_emailData) {
    throw new Error('sendTokenByEmail must be implemented');
  }

  async mergePdfs(_pdfData) {
    throw new Error('mergePdfs must be implemented');
  }
}