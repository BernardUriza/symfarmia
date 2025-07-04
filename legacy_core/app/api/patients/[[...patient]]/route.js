import { NextResponse } from 'next/server';
import { fetchPatients, savePatient, removePatient } from '../useCases/patients';
import { withErrorHandling, validateBody } from '../middlewares';

export const GET = withErrorHandling(async () => {
  const patients = await fetchPatients();
  return NextResponse.json(patients, { status: 200 });
});

export const POST = withErrorHandling(
  validateBody(['id', 'name', 'email', 'phone'], async (req) => {
    const { patient, created } = await savePatient(req.validatedBody);
    return NextResponse.json(patient, { status: created ? 201 : 200 });
  })
);

/**
 * DELETE method to remove a patient.
 * 
 * @param {NextApiRequest} req The Next.js API request object.
 * @returns {NextApiResponse} The response to be sent back to the client.
 */
export const DELETE = withErrorHandling(async (req) => {
  const patientId = parseInt(req.nextUrl.pathname.split('/').pop());
  if (!patientId) {
    return NextResponse.json({ error: 'Patient ID is required for deletion' }, { status: 400 });
  }
  await removePatient(patientId);
  return NextResponse.json({ success: true }, { status: 200 });
});
