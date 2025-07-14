import { Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

export class StudyRepository extends BaseRepository<Prisma.StudyDelegate> {
  constructor(prisma: PrismaClient) {
    super(prisma.study);
  }

  async getAllStudies() {
    return this.model.findMany({
      include: {
        type: true,
        medicalReport: true
      }
    });
  }

  async createStudy(data: Prisma.StudyCreateInput) {
    return this.model.create({
      data: { ...data, createdAt: new Date() }
    });
  }

  async getStudyById(id: number) {
    return this.model.findUnique({
      where: { id },
      include: {
        type: true,
        medicalReport: true
      }
    });
  }

  async updateStudy(id: number, data: Prisma.StudyUpdateInput) {
    return this.model.update({
      where: { id },
      data
    });
  }

  async deleteStudy(id: number) {
    return this.model.delete({
      where: { id }
    });
  }
}
