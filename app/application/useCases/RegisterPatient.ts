import { PatientRepository } from '../repositories/PatientRepository';
import { Patient } from '@/app/domain/entities/Patient';
import { CreatePatientData } from '@/types';

export class RegisterPatient {
  constructor(private readonly patients: PatientRepository) {}

  async execute(data: CreatePatientData): Promise<Patient> {
    const patient = await this.patients.create(data);
    return patient as Patient;
  }
}
