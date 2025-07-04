// useCases/fetchCategories.js
import Category from '../../../app/domain/entities/Category';

export async function fetchCategories() {
  try {
    const response = await fetch('/api/categories'); 
    if (response.ok) {
      const data = await response.json();
      return data.map((category) =>
        new Category(category.id, category.name, category.studyTypes)
      );
    } else {
      throw new Error('Error fetching categories');
    }
  } catch (error) {
    throw new Error('Error fetching categories: ' + error.message);
  }
}
