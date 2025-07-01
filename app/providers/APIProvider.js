export class APIProvider {
  async fetchPatients() {
    throw new Error('fetchPatients must be implemented');
  }

  async savePatient(patient) {
    throw new Error('savePatient must be implemented');
  }

  async removePatient(patientId) {
    throw new Error('removePatient must be implemented');
  }

  async fetchMedicalReports() {
    throw new Error('fetchMedicalReports must be implemented');
  }

  async fetchMedicalReport(reportId) {
    throw new Error('fetchMedicalReport must be implemented');
  }

  async saveMedicalReport(report) {
    throw new Error('saveMedicalReport must be implemented');
  }

  async removeMedicalReport(reportId) {
    throw new Error('removeMedicalReport must be implemented');
  }

  async fetchCategories() {
    throw new Error('fetchCategories must be implemented');
  }

  async saveCategory(category) {
    throw new Error('saveCategory must be implemented');
  }

  async fetchStudyTypes() {
    throw new Error('fetchStudyTypes must be implemented');
  }

  async saveStudyType(studyType) {
    throw new Error('saveStudyType must be implemented');
  }

  async saveStudy(study) {
    throw new Error('saveStudy must be implemented');
  }

  async removeStudy(studyId) {
    throw new Error('removeStudy must be implemented');
  }

  async sendTokenByEmail(emailData) {
    throw new Error('sendTokenByEmail must be implemented');
  }

  async mergePdfs(pdfData) {
    throw new Error('mergePdfs must be implemented');
  }
}