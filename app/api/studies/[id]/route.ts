import { NextResponse } from 'next/server';
import { createDatabase } from '@/app/infrastructure/database';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { studyRepository } = createDatabase();
  const id = parseInt(params.id);
  await studyRepository.deleteStudy(id);
  return NextResponse.json({ success: true }, { status: 200 });
}
