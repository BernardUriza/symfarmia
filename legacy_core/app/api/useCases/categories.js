import { getAllCategories, createCategory, updateCategory, getCategoryById } from '../../../prisma/categoriesClient';

export async function fetchCategories() {
  return await getAllCategories();
}

export async function saveCategory(data) {
  const { id, name } = data;
  const existing = await getCategoryById(id);
  if (existing) {
    const category = await updateCategory(id, { name });
    return { category, created: false };
  }
  const category = await createCategory({ id, name });
  return { category, created: true };
}
