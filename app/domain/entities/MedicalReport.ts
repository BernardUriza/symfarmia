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
    this.id = id;
    this.name = patient?.name;
    this.date = date;
    this.status = status;
    this.diagnosis = diagnosis ?? undefined;
    this.patient = patient;
    this.studies = studies;
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
