import { NextResponse } from 'next/server';
import { createDatabase } from '@/src/infrastructure/database';

export async function GET() {
  const { medicalReportRepository } = createDatabase();
  const reports = await medicalReportRepository.getAllMedicalReports();
  return NextResponse.json(reports, { status: 200 });
}

export async function POST(request: Request) {
  const { medicalReportRepository } = createDatabase();
  const data = await request.json();
  if (data.id) {
    const report = await medicalReportRepository.updateMedicalReport(data.id, data);
    return NextResponse.json(report, { status: 200 });
  }
  const report = await medicalReportRepository.createMedicalReport(data);
  return NextResponse.json(report, { status: 201 });
}
