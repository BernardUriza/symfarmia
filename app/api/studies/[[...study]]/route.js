import { NextResponse } from 'next/server'; // Import NextResponse
import {
  getAllStudies,
  createStudy,
  updateStudy,
  getStudyById,
  deleteStudy
} from '../../../../prisma/studiesClient';

export async function GET(req, context) {
  const { method, query } = req;
  const { study } = query;
  try {
    if (study && study.length > 0) {
      // If an ID is provided, fetch the specific study
      const studyId = parseInt(study[0]);
      const studyData = await getStudyById(studyId);

      if (studyData) {
        return NextResponse.json(studyData, { status: 200 });
      } else {
        return NextResponse.json({ error: 'Study not found' }, { status: 404 });
      }
    } else {
      // If no ID is provided, fetch all studies
      const studies = await getAllStudies();
      return NextResponse.json(studies, { status: 200 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching studies' }, { status: 500 });
  }
}
export async function POST(req, context) {
  try {
    const body = await req.json();
    const { id, medicalReportId, name, type, title } = body;

    // Validation of the fields
    if (!medicalReportId || !type || !name)  {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // You may perform additional validations according to your needs, e.g., validate the date format or the value of the status.

    // Check if the study already exists by its ID
    const existingStudy = id === "" ? false : await getStudyById(id);

    if (existingStudy) {
      // If the study exists, update it
      const updatedStudy = await updateStudy(id, {
        name,
        title: title,
        studyTypeId: type.id
      });
      return NextResponse.json(updatedStudy, { status: 200 });
    } else {
      // If the study does not exist, create it as a new study
      const newStudy = await createStudy({
        medicalReportId,
        name,
        title: title,
        studyTypeId: type.id, // categoryId instead of the complete category object
      });
      return NextResponse.json(newStudy, { status: 201 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error saving study ' + error }, { status: 500 });
  }
}
/**
 * DELETE method to remove a study.
 * 
 * @param {NextApiRequest} req The Next.js API request object.
 * @returns {NextApiResponse} The response to be sent back to the client.
 */
export async function DELETE(req) {
  try {
    // Extract the patient ID from the URL path
    const StudyId = parseInt(req.nextUrl.pathname.split('/').pop());

    if (!StudyId) {
      return NextResponse.json({ error: 'Study ID is required for deletion' }, { status: 400 });
    }

    // Check if the patient exists
    const existingStudy = await getStudyById(StudyId);
    if (!existingStudy) {
      return NextResponse.json({ error: 'Study not found' }, { status: 404 });
    }

    // Perform the deletion
    const result = await deleteStudy(StudyId);
    return NextResponse.json({ message: 'Study successfully deleted', result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error deleting Study: ' + error.message }, { status: 500 });
  }
}