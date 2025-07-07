import { NextResponse } from 'next/server';
import { createDatabase } from '@/app/infrastructure/database';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { studyTypeRepository } = createDatabase();
  const id = parseInt(params.id);
  await studyTypeRepository.deleteStudyType(id);
  return NextResponse.json({ success: true }, { status: 200 });
}
