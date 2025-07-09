import { NextResponse } from 'next/server';
import { createDatabase } from '@/app/infrastructure/database';
import { withAuth } from '@/lib/middleware/auth';

export const GET = withAuth(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { medicalReportRepository } = createDatabase();
  const { id: paramId } = await params;
  const id = parseInt(paramId);
  const report = await medicalReportRepository.getMedicalReportById(id);
  if (!report) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(report, { status: 200 });
});

export const DELETE = withAuth(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { medicalReportRepository } = createDatabase();
  const { id: paramId } = await params;
  const id = parseInt(paramId);
  await medicalReportRepository.deleteMedicalReport(id);
  return NextResponse.json({ success: true }, { status: 200 });
}, { role: 'SYMFARMIA-Admin' });
