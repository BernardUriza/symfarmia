// categories.js

import { NextResponse } from 'next/server'; // Import NextResponse
import { fetchCategories, saveCategory } from '../useCases/categories';
import { withErrorHandling, validateBody } from '../middlewares';

export const GET = withErrorHandling(async () => {
  const categories = await fetchCategories();
  return NextResponse.json(categories, { status: 200 });
});

export const POST = withErrorHandling(
  validateBody(['id', 'name'], async (req) => {
    const { category, created } = await saveCategory(req.validatedBody);
    return NextResponse.json(category, { status: created ? 201 : 200 });
  })
);
