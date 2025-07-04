import { Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

export class PatientRepository extends BaseRepository<Prisma.PatientDelegate<Prisma.DefaultArgs>> {
  constructor(prisma: PrismaClient) {
    super(prisma.patient);
  }

  async getAllPatients() {
    return this.model.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async createPatient(data: Prisma.PatientCreateInput) {
    return this.model.create({
      data: { ...data },
    });
  }

  async getPatientById(id: number) {
    return this.model.findUnique({
      where: { id },
    });
  }

  async updatePatient(id: number, data: Prisma.PatientUpdateInput) {
    return this.model.update({
      where: { id },
      data,
    });
  }

  async deletePatient(id: number) {
    return this.model.delete({
      where: { id },
    });
  }
}
