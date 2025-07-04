import { Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

export class StudyTypeRepository extends BaseRepository<Prisma.StudyTypeDelegate<Prisma.DefaultArgs>> {
  constructor(prisma: PrismaClient) {
    super(prisma.studyType);
  }

  async getAllStudyTypes() {
    return this.model.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  async createStudyType(data: Prisma.StudyTypeCreateInput) {
    return this.model.create({
      data: { ...data },
    });
  }

  async getStudyTypeById(id: number) {
    return this.model.findUnique({
      where: { id },
    });
  }

  async updateStudyType(id: number, data: Prisma.StudyTypeUpdateInput) {
    return this.model.update({
      where: { id },
      data,
    });
  }

  async deleteStudyType(id: number) {
    return this.model.delete({
      where: { id },
    });
  }
}
