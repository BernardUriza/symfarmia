import { NextResponse } from 'next/server';
import { createDatabase } from '@/src/infrastructure/database';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { categoryRepository } = createDatabase();
  const { id: paramId } = await params;
  const id = parseInt(paramId);
  await categoryRepository.deleteCategory(id);
  return NextResponse.json({ success: true }, { status: 200 });
}
