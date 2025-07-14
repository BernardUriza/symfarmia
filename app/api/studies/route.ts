import { NextResponse } from 'next/server';
import { createDatabase } from '@/src/infrastructure/database';

export async function GET() {
  const { studyRepository } = createDatabase();
  const studies = await studyRepository.getAllStudies();
  return NextResponse.json(studies, { status: 200 });
}

export async function POST(request: Request) {
  const { studyRepository } = createDatabase();
  const data = await request.json();
  if (data.id) {
    const study = await studyRepository.updateStudy(data.id, data);
    return NextResponse.json(study, { status: 200 });
  }
  const study = await studyRepository.createStudy(data);
  return NextResponse.json(study, { status: 201 });
}
