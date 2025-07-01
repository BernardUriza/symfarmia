import { NextResponse } from 'next/server';
import {
  getAllMedicalReports,
  createMedicalReport,
  updateMedicalReport,
  getMedicalReportById,
  deleteMedicalReport
} from '../../../../prisma/medicalReportsClient';

// Manejador para el método GET
export async function GET(req) {
  const reportId = parseInt(req.nextUrl.pathname.split('/').pop());

  if (reportId > 0) {
    const report = await getMedicalReportById(reportId);
    return report
      ? NextResponse.json(report, { status: 200 })
      : NextResponse.json({ error: 'Medical report not found: ' + reportId }, { status: 404 });
  }
  const medicalReports = await getAllMedicalReports();
  return NextResponse.json(medicalReports, { status: 200 });
}

// Manejador para el método POST
export const POST = async (req) => {
  const body = await req.json();
  const { id, name, date, status, expirationDate, patient, studies } = body;

  let existingReport = parseInt(id) > 0 ? await getMedicalReportById(id) : false;

  if (existingReport) {
    const updatedReport = await updateMedicalReport(id, {
      name,
      date,
      status,
      expirationDate: expirationDate !== null ? expirationDate : existingReport.expirationDate
    });
    return NextResponse.json(updatedReport, { status: 200 });
  } else {
    const newReport = await createMedicalReport({
      name,
      date,
      status,
      diagnosis: 'Default Diagnosis',
      patient: {
        create: patient
      },
      studies: {
        create: studies.map((study) => ({
          name: study.name,
          title: study.title,
          studyTypeId: study.type.id,
          createdAt: study.createdAt,
          // add other properties as needed
        }))
      }
    });
    return NextResponse.json(newReport, { status: 201 });
  }
};

export const DELETE = async (request) => {
  // Extract the pathname from the URL
  const pathname = request.nextUrl.pathname;

  // Split the pathname into segments and extract the medicalReport ID
  // Assuming the URL format is /api/medicalReports/[id]
  const segments = pathname.split('/');
  const medicalReport = segments[segments.length - 1];

  if (!medicalReport) {
    return new NextResponse(JSON.stringify({ error: 'ID is required for deletion' }), { status: 400 });
  }

  // Assuming medicalReport is a single value and not an array
  const reportIdToDelete = parseInt(medicalReport);
  if (isNaN(reportIdToDelete)) {
    return new NextResponse(JSON.stringify({ error: 'Invalid ID format' }), { status: 400 });
  }

  try {
    const result = await deleteMedicalReport(reportIdToDelete);
    return new NextResponse(JSON.stringify(result), { status: 200 }); // Successful DELETE operation
  } catch (error) {
    // Handle potential errors from deleteMedicalReport
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
