import { NextResponse } from 'next/server'; // Import NextResponse
import {
  getAllStudyTypes,
  createStudyType,
  updateStudyType,
  getStudyTypeById,
} from '../../../prisma/studyTypesClient';

export async function GET() {
  try {
    const studyTypes = await getAllStudyTypes();
    return NextResponse.json(studyTypes, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching study types' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, name, description, categoryId } = body;

    // Validation of fields
    if (!id || !name || !description || !categoryId) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    // Verify if the study type already exists by its ID
    const existingStudyType = await getStudyTypeById(id);

    if (existingStudyType) {
      // If the study type exists, update it
      const updatedStudyType = await updateStudyType(id, { name, description, categoryId });
      return NextResponse.json(updatedStudyType, { status: 200 });
    } else {
      // If the study type does not exist, create it as a new study type
      const newStudyType = await createStudyType({ id, name, description, categoryId });
      return NextResponse.json(newStudyType, { status: 201 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error saving study type ' + error }, { status: 500 });
  }
}
