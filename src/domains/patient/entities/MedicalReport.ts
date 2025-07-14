import jwt from 'jsonwebtoken';
import Patient from './Patient';
import Study from './Study';

export default class MedicalReport {
  id?: number;
  name?: string;
  date: Date;
  status: string;
  diagnosis?: string | null;
  patient?: Patient;
  studies?: Study[];
  patientId: number;
  expirationDate?: string;

  constructor({ id, date, status, diagnosis, patient, studies, patientId }: {
    id?: number;
    date: Date;
    status: string;
    diagnosis?: string | null;
    patient?: Patient;
    studies?: Study[];
    patientId: number;
  }) {
    if (id !== undefined) {
      this.id = id;
    }
    const patientName = patient?.name;
    if (patientName !== undefined) {
      this.name = patientName;
    }
    this.date = date;
    this.status = status;
    if (diagnosis !== undefined) {
      this.diagnosis = diagnosis;
    }
    if (patient !== undefined) {
      this.patient = patient;
    }
    if (studies !== undefined) {
      this.studies = studies;
    }
    this.patientId = patientId;
  }

  validate(): boolean {
    return !!(this.patientId && this.date && this.status);
  }

  updateStatus(status: string): void {
    this.status = status;
  }

  generateToken(): string {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 15);
    const token = jwt.sign({ medicalReportId: this.id }, 'tu_secreto_secreto', {
      expiresIn: '15d',
    });
    this.expirationDate = expirationDate.toISOString();
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/token/${token}`;
    return url;
  }
}
