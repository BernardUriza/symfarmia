// categories.js

import { NextResponse } from 'next/server'; // Import NextResponse
import { getAllCategories, createCategory, updateCategory, getCategoryById } from '../../../prisma/categoriesClient';

export async function GET(request) {
  try {
    const categories = await getAllCategories();
    return NextResponse.json(categories, { status: 200 }); // Return a NextResponse
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 }); // Return a NextResponse
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name } = body;

    // Validation of fields
    if (!id || !name) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 }); // Return a NextResponse
    }

    // Verify if the category already exists by its ID
    const existingCategory = await getCategoryById(id);

    if (existingCategory) {
      // If the category exists, update it
      const updatedCategory = await updateCategory(id, { name });
      return NextResponse.json(updatedCategory, { status: 200 }); // Return a NextResponse
    } else {
      // If the category does not exist, create it as a new category
      const newCategory = await createCategory({ id, name });
      return NextResponse.json(newCategory, { status: 201 }); // Return a NextResponse
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error saving category ' + error }, { status: 500 }); // Return a NextResponse
  }
}
