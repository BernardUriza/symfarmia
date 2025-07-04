import { MedicalReportRepository } from '../repositories/MedicalReportRepository';
import { PatientRepository } from '../repositories/PatientRepository';
import { MedicalReport } from '@/app/domain/entities/MedicalReport';
import { CreateMedicalReportData } from '@/types';

export class CreateMedicalReport {
  constructor(
    private readonly medicalReports: MedicalReportRepository,
    private readonly patients: PatientRepository
  ) {}

  async execute(data: CreateMedicalReportData): Promise<MedicalReport> {
    const patient = await this.patients.findById(data.patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }
    const report = await this.medicalReports.create(data);
    return report as MedicalReport;
  }
}
