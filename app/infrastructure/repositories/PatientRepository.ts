import { Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { cachedQuery } from '@/lib/services/prisma';

export class PatientRepository extends BaseRepository<Prisma.PatientDelegate> {
  constructor(prisma: PrismaClient) {
    super(prisma.patient);
  }

  async getAllPatients(limit = 50, offset = 0) {
    const key = `patients:${limit}:${offset}`;
    return cachedQuery(key, () =>
      this.model.findMany({
        take: limit,
        skip: offset,
        orderBy: { name: 'asc' },
        select: { id: true, name: true, email: true, phone: true, status: true }
      })
    );
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
