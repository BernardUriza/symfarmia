/**
 * Mock API for Local Testing
 * Provides dummy data and API responses for development and testing
 */

import { faker } from '@faker-js/faker'

// Generate mock patients
const generateMockPatients = (count = 10) => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    dateOfBirth: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    medicalHistory: faker.lorem.sentences(2),
    emergencyContact: faker.person.fullName(),
    emergencyPhone: faker.phone.number(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  }))
}

// Generate mock medical reports
const generateMockMedicalReports = (patientId, count = 5) => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    patientId: patientId,
    diagnosis: faker.lorem.sentence(),
    symptoms: faker.lorem.sentences(3),
    treatment: faker.lorem.sentences(2),
    date: faker.date.recent(),
    status: faker.helpers.arrayElement(['completed', 'pending', 'in-progress']),
    doctorNotes: faker.lorem.paragraph(),
    followUpDate: faker.date.future(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  }))
}

// Generate mock studies
const generateMockStudies = (reportId, count = 3) => {
  const studyTypes = ['Blood Test', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'ECG', 'Urine Test']
  
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    reportId: reportId,
    type: faker.helpers.arrayElement(studyTypes),
    description: faker.lorem.sentence(),
    result: faker.lorem.sentences(2),
    status: faker.helpers.arrayElement(['completed', 'pending', 'in-progress']),
    performedDate: faker.date.recent(),
    resultDate: faker.date.recent(),
    technician: faker.person.fullName(),
    equipment: faker.lorem.word(),
    notes: faker.lorem.paragraph(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  }))
}

// Generate mock study types
const generateMockStudyTypes = () => {
  const types = [
    { name: 'Blood Test', category: 'Laboratory', description: 'Blood analysis and testing' },
    { name: 'X-Ray', category: 'Imaging', description: 'X-ray imaging studies' },
    { name: 'MRI', category: 'Imaging', description: 'Magnetic resonance imaging' },
    { name: 'CT Scan', category: 'Imaging', description: 'Computed tomography scan' },
    { name: 'Ultrasound', category: 'Imaging', description: 'Ultrasound examination' },
    { name: 'ECG', category: 'Cardiology', description: 'Electrocardiogram' },
    { name: 'Urine Test', category: 'Laboratory', description: 'Urine analysis' }
  ]

  return types.map((type, index) => ({
    id: index + 1,
    ...type,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  }))
}

// Mock API class
class MockAPI {
  constructor() {
    this.patients = generateMockPatients(15)
    this.studyTypes = generateMockStudyTypes()
    this.medicalReports = []
    this.studies = []

    // Generate medical reports for each patient
    this.patients.forEach(patient => {
      const reports = generateMockMedicalReports(patient.id, 3)
      this.medicalReports.push(...reports)

      // Generate studies for each report
      reports.forEach(report => {
        const studies = generateMockStudies(report.id, 2)
        this.studies.push(...studies)
      })
    })
  }

  // Simulate API delay
  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Mock API methods
  async getPatients() {
    await this.delay()
    return { success: true, data: this.patients }
  }

  async getPatient(id) {
    await this.delay()
    const patient = this.patients.find(p => p.id === parseInt(id))
    return patient ? { success: true, data: patient } : { success: false, error: 'Patient not found' }
  }

  async getMedicalReports(patientId = null) {
    await this.delay()
    const reports = patientId 
      ? this.medicalReports.filter(r => r.patientId === parseInt(patientId))
      : this.medicalReports
    return { success: true, data: reports }
  }

  async getMedicalReport(id) {
    await this.delay()
    const report = this.medicalReports.find(r => r.id === parseInt(id))
    return report ? { success: true, data: report } : { success: false, error: 'Report not found' }
  }

  async getStudies(reportId = null) {
    await this.delay()
    const studies = reportId 
      ? this.studies.filter(s => s.reportId === parseInt(reportId))
      : this.studies
    return { success: true, data: studies }
  }

  async getStudyTypes() {
    await this.delay()
    return { success: true, data: this.studyTypes }
  }

  async createPatient(patientData) {
    await this.delay()
    const newPatient = {
      id: this.patients.length + 1,
      ...patientData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.patients.push(newPatient)
    return { success: true, data: newPatient }
  }

  async updatePatient(id, patientData) {
    await this.delay()
    const patientIndex = this.patients.findIndex(p => p.id === parseInt(id))
    if (patientIndex === -1) {
      return { success: false, error: 'Patient not found' }
    }
    
    this.patients[patientIndex] = {
      ...this.patients[patientIndex],
      ...patientData,
      updatedAt: new Date()
    }
    return { success: true, data: this.patients[patientIndex] }
  }

  async deletePatient(id) {
    await this.delay()
    const patientIndex = this.patients.findIndex(p => p.id === parseInt(id))
    if (patientIndex === -1) {
      return { success: false, error: 'Patient not found' }
    }
    
    this.patients.splice(patientIndex, 1)
    return { success: true, message: 'Patient deleted successfully' }
  }

  // Health check endpoint
  async healthCheck() {
    await this.delay(100)
    return {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: 'development',
      counts: {
        patients: this.patients.length,
        medicalReports: this.medicalReports.length,
        studies: this.studies.length,
        studyTypes: this.studyTypes.length
      }
    }
  }
}

// Create singleton instance
const mockAPI = new MockAPI()

export default mockAPI