import { NextResponse } from 'next/server';
import { createDatabase } from '@/app/infrastructure/database';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { categoryRepository } = createDatabase();
  const id = parseInt(params.id);
  await categoryRepository.deleteCategory(id);
  return NextResponse.json({ success: true }, { status: 200 });
}
