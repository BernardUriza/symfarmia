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

    // Validation of fields
    if (!id || !name || !email || !phone) {
      return NextResponse.json({ error: 'Falta uno de los campos son obligatorios' }, { status: 400 });
    }

    // Verify if the patient already exists by their ID
    const existingPatient = await getPatientById(id);

    if (existingPatient) {
      // If the patient exists, update them
      const updatedPatient = await updatePatient(id, { name, email, phone });
      return NextResponse.json(updatedPatient, { status: 200 });
    } else {
      // If the patient does not exist, create them as a new patient
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
    // Extract the patient ID from the URL path
    const patientId = parseInt(req.nextUrl.pathname.split('/').pop());

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required for deletion' }, { status: 400 });
    }

    // Check if the patient exists
    const existingPatient = await getPatientById(patientId);
    if (!existingPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Perform the deletion
    const result = await deletePatient(patientId);
    return NextResponse.json({ message: 'Patient successfully deleted', result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error deleting patient: ' + error.message }, { status: 500 });
  }
}