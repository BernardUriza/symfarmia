import { NextResponse } from 'next/server';
import { createDatabase } from '@/app/infrastructure/database';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { medicalReportRepository } = createDatabase();
  const id = parseInt(params.id);
  const report = await medicalReportRepository.getMedicalReportById(id);
  if (!report) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(report, { status: 200 });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { medicalReportRepository } = createDatabase();
  const id = parseInt(params.id);
  await medicalReportRepository.deleteMedicalReport(id);
  return NextResponse.json({ success: true }, { status: 200 });
}
