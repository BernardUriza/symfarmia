import { NextResponse } from 'next/server';
import { createDatabase } from '@/app/infrastructure/database';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { medicalReportRepository } = createDatabase();
  const { id: paramId } = await params;
  const id = parseInt(paramId);
  const report = await medicalReportRepository.getMedicalReportById(id);
  if (!report) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(report, { status: 200 });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { medicalReportRepository } = createDatabase();
  const { id: paramId } = await params;
  const id = parseInt(paramId);
  await medicalReportRepository.deleteMedicalReport(id);
  return NextResponse.json({ success: true }, { status: 200 });
}
