import { Patient } from './Patient';

export class MedicalReport {
  constructor(
    public id: number,
    public date: Date,
    public status: string,
    public diagnosis: string | null,
    public patientId: number,
    public patient?: Patient
  ) {}
}
