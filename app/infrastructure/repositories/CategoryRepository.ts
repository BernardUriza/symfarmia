import { Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

export class CategoryRepository extends BaseRepository<Prisma.CategoryDelegate> {
  constructor(prisma: PrismaClient) {
    super(prisma.category);
  }

  async getAllCategories() {
    return this.model.findMany({
      include: {
        studyTypes: {
          include: { category: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async createCategory(data: Prisma.CategoryCreateInput) {
    return this.model.create({
      data: { ...data }
    });
  }

  async getCategoryById(id: number) {
    return this.model.findUnique({
      where: { id }
    });
  }

  async updateCategory(id: number, data: Prisma.CategoryUpdateInput) {
    return this.model.update({
      where: { id },
      data
    });
  }

  async deleteCategory(id: number) {
    return this.model.delete({
      where: { id }
    });
  }
}
