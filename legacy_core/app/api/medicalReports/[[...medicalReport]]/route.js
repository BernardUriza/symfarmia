import { NextResponse } from 'next/server';
import {
  fetchMedicalReports,
  fetchMedicalReport,
  saveMedicalReport,
  removeMedicalReport,
} from '../useCases/medicalReports';
import { withErrorHandling, validateBody } from '../middlewares';

export const GET = withErrorHandling(async (req) => {
  const reportId = parseInt(req.nextUrl.pathname.split('/').pop());
  if (reportId > 0) {
    const report = await fetchMedicalReport(reportId);
    return report
      ? NextResponse.json(report, { status: 200 })
      : NextResponse.json({ error: 'Medical report not found: ' + reportId }, { status: 404 });
  }
  const medicalReports = await fetchMedicalReports();
  return NextResponse.json(medicalReports, { status: 200 });
});

export const POST = withErrorHandling(
  validateBody(['name', 'date', 'status'], async (req) => {
    const { report, created } = await saveMedicalReport(req.validatedBody);
    return NextResponse.json(report, { status: created ? 201 : 200 });
  })
);

export const DELETE = withErrorHandling(async (request) => {
  const segments = request.nextUrl.pathname.split('/');
  const medicalReport = segments[segments.length - 1];
  if (!medicalReport) {
    return new NextResponse(JSON.stringify({ error: 'ID is required for deletion' }), { status: 400 });
  }
  const reportIdToDelete = parseInt(medicalReport);
  if (isNaN(reportIdToDelete)) {
    return new NextResponse(JSON.stringify({ error: 'Invalid ID format' }), { status: 400 });
  }
  await removeMedicalReport(reportIdToDelete);
  return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
});
