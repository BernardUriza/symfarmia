import { NextResponse } from 'next/server';
import { createDatabase } from '@/src/infrastructure/database';

export async function GET() {
  const { categoryRepository } = createDatabase();
  const categories = await categoryRepository.getAllCategories();
  return NextResponse.json(categories, { status: 200 });
}

export async function POST(request: Request) {
  const { categoryRepository } = createDatabase();
  const data = await request.json();
  if (data.id) {
    const category = await categoryRepository.updateCategory(data.id, data);
    return NextResponse.json(category, { status: 200 });
  }
  const category = await categoryRepository.createCategory(data);
  return NextResponse.json(category, { status: 201 });
}
