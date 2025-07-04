import Category from './Category';

export default class StudyType {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  category?: Category;

  constructor(id: number, name: string, description: string, categoryId: number, category?: Category) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.categoryId = categoryId;
    this.category = category;
  }
}
