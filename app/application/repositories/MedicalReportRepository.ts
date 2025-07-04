import { MedicalReport, CreateMedicalReportData, UpdateMedicalReportData } from '@/types';

export interface MedicalReportRepository {
  create(data: CreateMedicalReportData): Promise<MedicalReport>;
  update(data: UpdateMedicalReportData): Promise<MedicalReport>;
  findById(id: number): Promise<MedicalReport | null>;
  findAll(): Promise<MedicalReport[]>;
  delete(id: number): Promise<void>;
}
