import { MedicalReport, CreateMedicalReportData, UpdateMedicalReportData } from '@/types';
import { BaseRepository } from '../BaseRepository';

export interface IMedicalReportRepository extends BaseRepository<
  MedicalReport,
  CreateMedicalReportData,
  UpdateMedicalReportData
> {}
