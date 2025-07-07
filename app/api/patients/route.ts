import { NextResponse } from 'next/server';
import { createDatabase } from '@/app/infrastructure/database';

export async function GET() {
  const { patientRepository } = createDatabase();
  const patients = await patientRepository.getAllPatients();
  return NextResponse.json(patients, { status: 200 });
}

export async function POST(request: Request) {
  const { patientRepository } = createDatabase();
  const data = await request.json();
  if (data.id) {
    const patient = await patientRepository.updatePatient(data.id, data);
    return NextResponse.json(patient, { status: 200 });
  }
  const patient = await patientRepository.createPatient(data);
  return NextResponse.json(patient, { status: 201 });
}
