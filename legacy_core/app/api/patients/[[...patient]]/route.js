import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getAllPatients,
  createPatient,
  updatePatient,
  getPatientById,
  deletePatient
} from '../../../../prisma/patientsClient';
import {
  validate,
  ValidationError
} from '../../../../../../app/middleware/validation';
import { withErrorHandling } from '../../../../../../app/middleware/errorHandler';

const patientSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string()
});

export const GET = withErrorHandling(async (_req) => {
  const patients = await getAllPatients();
  return NextResponse.json(patients, { status: 200 });
});

export const POST = withErrorHandling(async (req) => {
  const { id, name, email, phone } = await validate(req, patientSchema);

  const existingPatient = await getPatientById(id);

  if (existingPatient) {
    const updatedPatient = await updatePatient(id, { name, email, phone });
    return NextResponse.json(updatedPatient, { status: 200 });
  } else {
    const newPatient = await createPatient({ id, name, email, phone });
    return NextResponse.json(newPatient, { status: 201 });
  }
});

/**
 * DELETE method to remove a patient.
 * 
 * @param {NextApiRequest} req The Next.js API request object.
 * @returns {NextApiResponse} The response to be sent back to the client.
 */
export const DELETE = withErrorHandling(async (req) => {
  const patientId = parseInt(req.nextUrl.pathname.split('/').pop());
  if (!patientId) {
    throw new ValidationError('Patient ID is required for deletion');
  }

  const existingPatient = await getPatientById(patientId);
  if (!existingPatient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
  }

  const result = await deletePatient(patientId);
  return NextResponse.json({ message: 'Patient successfully deleted', result }, { status: 200 });
});
