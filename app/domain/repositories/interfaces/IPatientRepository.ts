import { Patient, CreatePatientData, UpdatePatientData } from '@/types';
import { BaseRepository } from '../BaseRepository';

export interface IPatientRepository extends BaseRepository<
  Patient,
  CreatePatientData,
  UpdatePatientData
> {}
