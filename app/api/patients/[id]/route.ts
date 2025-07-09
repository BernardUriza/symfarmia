import { NextResponse } from 'next/server';
import { createDatabase } from '@/app/infrastructure/database';
import { withAuth } from '@/lib/middleware/auth';

export const DELETE = withAuth(async (_req, { params }: { params: Promise<{ id: string }> }) => {
  const { patientRepository } = createDatabase();
  const { id: paramId } = await params;
  const id = parseInt(paramId);
  await patientRepository.deletePatient(id);
  return NextResponse.json({ success: true }, { status: 200 });
}, { role: 'SYMFARMIA-Admin' });
