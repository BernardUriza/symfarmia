import { NextResponse } from 'next/server';
import { gzipSync } from 'zlib';
import { createDatabase } from '@/app/infrastructure/database';
import { withAuth } from '@/lib/middleware/auth';

export const GET = withAuth(async (req) => {
  const { patientRepository } = createDatabase();
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const patients = await patientRepository.getAllPatients(limit, offset);
  const data = JSON.stringify(patients);
  const compressed = gzipSync(data);
  return new NextResponse(compressed, {
    status: 200,
    headers: { 'Content-Encoding': 'gzip', 'Content-Type': 'application/json' }
  });
});

export const POST = withAuth(async (request) => {
  const { patientRepository } = createDatabase();
  const data = await request.json();
  if (data.id) {
    const patient = await patientRepository.updatePatient(data.id, data);
    return NextResponse.json(patient, { status: 200 });
  }
  const patient = await patientRepository.createPatient(data);
  return NextResponse.json(patient, { status: 201 });
}, { role: 'SYMFARMIA-Admin' });
