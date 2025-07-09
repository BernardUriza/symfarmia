import { NextResponse } from 'next/server';
import { gzipSync } from 'zlib';
import { createDatabase } from '@/app/infrastructure/database';
import { withAuth } from '@/lib/middleware/auth';

export const GET = withAuth(async (req) => {
  const { medicalReportRepository } = createDatabase();
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const reports = await medicalReportRepository.getAllMedicalReports(limit, offset);
  const data = JSON.stringify(reports);
  const compressed = gzipSync(data);
  return new NextResponse(compressed, {
    status: 200,
    headers: { 'Content-Encoding': 'gzip', 'Content-Type': 'application/json' }
  });
});

export const POST = withAuth(async (request) => {
  const { medicalReportRepository } = createDatabase();
  const data = await request.json();
  if (data.id) {
    const report = await medicalReportRepository.updateMedicalReport(data.id, data);
    return NextResponse.json(report, { status: 200 });
  }
  const report = await medicalReportRepository.createMedicalReport(data);
  return NextResponse.json(report, { status: 201 });
}, { role: 'SYMFARMIA-Admin' });
