import { NextResponse } from 'next/server';
import { fetchStudies, fetchStudy, saveStudy, removeStudy } from '../useCases/studies';
import { withErrorHandling, validateBody } from '../middlewares';

export const GET = withErrorHandling(async (req) => {
  const { study } = req.query || {};
  if (study && study.length > 0) {
    const studyId = parseInt(study[0]);
    const studyData = await fetchStudy(studyId);
    return studyData
      ? NextResponse.json(studyData, { status: 200 })
      : NextResponse.json({ error: 'Study not found' }, { status: 404 });
  }
  const studies = await fetchStudies();
  return NextResponse.json(studies, { status: 200 });
});
export const POST = withErrorHandling(
  validateBody(['medicalReportId', 'type', 'name'], async (req) => {
    const { study, created } = await saveStudy(req.validatedBody);
    return NextResponse.json(study, { status: created ? 201 : 200 });
  })
);
/**
 * DELETE method to remove a study.
 * 
 * @param {NextApiRequest} req The Next.js API request object.
 * @returns {NextApiResponse} The response to be sent back to the client.
 */
export const DELETE = withErrorHandling(async (req) => {
  const StudyId = parseInt(req.nextUrl.pathname.split('/').pop());
  if (!StudyId) {
    return NextResponse.json({ error: 'Study ID is required for deletion' }, { status: 400 });
  }
  await removeStudy(StudyId);
  return NextResponse.json({ success: true }, { status: 200 });
});
