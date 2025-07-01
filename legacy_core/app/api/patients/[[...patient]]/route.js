import { NextResponse } from 'next/server';
import {
  getAllPatients,
  createPatient,
  updatePatient,
  getPatientById,
  deletePatient
} from '../../../../prisma/patientsClient';

export async function GET(req) {
  try {
    const patients = await getAllPatients();
    return NextResponse.json(patients, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching patients' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, name, email, phone } = body;

    if (!id || !name || !email || !phone) {
      return NextResponse.json({ error: 'Falta uno de los campos son obligatorios' }, { status: 400 });
    }

    const existingPatient = await getPatientById(id);

    if (existingPatient) {
      const updatedPatient = await updatePatient(id, { name, email, phone });
      return NextResponse.json(updatedPatient, { status: 200 });
    } else {
      const newPatient = await createPatient({ id, name, email, phone });
      return NextResponse.json(newPatient, { status: 201 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error saving patient ' + error }, { status: 500 });
  }
}

/**
 * DELETE method to remove a patient.
 * 
 * @param {NextApiRequest} req The Next.js API request object.
 * @returns {NextApiResponse} The response to be sent back to the client.
 */
export async function DELETE(req) {
  try {
    const patientId = parseInt(req.nextUrl.pathname.split('/').pop());

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required for deletion' }, { status: 400 });
    }

    const existingPatient = await getPatientById(patientId);
    if (!existingPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const result = await deletePatient(patientId);
    return NextResponse.json({ message: 'Patient successfully deleted', result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error deleting patient: ' + error.message }, { status: 500 });
  }
}