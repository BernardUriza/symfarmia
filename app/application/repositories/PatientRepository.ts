import { Patient, CreatePatientData, UpdatePatientData } from '@/types';

export interface PatientRepository {
  create(data: CreatePatientData): Promise<Patient>;
  update(data: UpdatePatientData): Promise<Patient>;
  findById(id: number): Promise<Patient | null>;
  findAll(): Promise<Patient[]>;
  delete(id: number): Promise<void>;
}
