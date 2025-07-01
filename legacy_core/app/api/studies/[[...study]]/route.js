import { NextResponse } from 'next/server';import {
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
      const studyId = parseInt(study[0]);
      const studyData = await getStudyById(studyId);

      if (studyData) {
        return NextResponse.json(studyData, { status: 200 });
      } else {
        return NextResponse.json({ error: 'Study not found' }, { status: 404 });
      }
    } else {
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

    if (!medicalReportId || !type || !name)  {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }


    const existingStudy = id === "" ? false : await getStudyById(id);

    if (existingStudy) {
      const updatedStudy = await updateStudy(id, {
        name,
        title: title,
        studyTypeId: type.id
      });
      return NextResponse.json(updatedStudy, { status: 200 });
    } else {
      const newStudy = await createStudy({
        medicalReportId,
        name,
        title: title,
        studyTypeId: type.id,
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
    const StudyId = parseInt(req.nextUrl.pathname.split('/').pop());

    if (!StudyId) {
      return NextResponse.json({ error: 'Study ID is required for deletion' }, { status: 400 });
    }

    const existingStudy = await getStudyById(StudyId);
    if (!existingStudy) {
      return NextResponse.json({ error: 'Study not found' }, { status: 404 });
    }

    const result = await deleteStudy(StudyId);
    return NextResponse.json({ message: 'Study successfully deleted', result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error deleting Study: ' + error.message }, { status: 500 });
  }
}