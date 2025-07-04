import { NextResponse } from 'next/server'; // Import NextResponse
import { fetchStudyTypes, saveStudyType } from '../useCases/studyTypes';
import { withErrorHandling, validateBody } from '../middlewares';

export const GET = withErrorHandling(async () => {
  const studyTypes = await fetchStudyTypes();
  return NextResponse.json(studyTypes, { status: 200 });
});

export const POST = withErrorHandling(
  validateBody(['id', 'name', 'description', 'categoryId'], async (req) => {
    const { studyType, created } = await saveStudyType(req.validatedBody);
    return NextResponse.json(studyType, { status: created ? 201 : 200 });
  })
);
