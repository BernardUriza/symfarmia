import { NextResponse } from 'next/server';
import { createDatabase } from '@/src/infrastructure/database';

export async function GET() {
  const { studyTypeRepository } = createDatabase();
  const types = await studyTypeRepository.getAllStudyTypes();
  return NextResponse.json(types, { status: 200 });
}

export async function POST(request: Request) {
  const { studyTypeRepository } = createDatabase();
  const data = await request.json();
  if (data.id) {
    const type = await studyTypeRepository.updateStudyType(data.id, data);
    return NextResponse.json(type, { status: 200 });
  }
  const type = await studyTypeRepository.createStudyType(data);
  return NextResponse.json(type, { status: 201 });
}
