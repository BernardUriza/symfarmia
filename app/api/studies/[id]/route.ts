import { NextResponse } from 'next/server';
import { createDatabase } from '@/app/infrastructure/database';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { studyRepository } = createDatabase();
  const { id: paramId } = await params;
  const id = parseInt(paramId);
  await studyRepository.deleteStudy(id);
  return NextResponse.json({ success: true }, { status: 200 });
}
