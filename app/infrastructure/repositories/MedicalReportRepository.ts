import { Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

export class MedicalReportRepository extends BaseRepository<Prisma.MedicalReportDelegate> {
  constructor(prisma: PrismaClient) {
    super(prisma.medicalReport);
  }

  async getAllMedicalReports() {
    const currentDate = new Date();
    const medicalReports = await this.model.findMany({
      include: {
        patient: true,
        studies: {
          include: {
            type: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        patient: {
          name: 'asc',
        },
      },
    });

    return medicalReports.map((report) => {
      const expirationDate = new Date(report.expirationDate as Date);
      const isActive = report.status === 'Activo';
      if (currentDate > expirationDate && isActive) {
        return { ...report, status: 'Enviado' };
      }
      return report;
    });
  }

  async createMedicalReport(data: Prisma.MedicalReportCreateInput) {
    return this.model.create({
      data: { ...data, createdAt: new Date() },
      include: {
        patient: true,
        studies: true,
      },
    });
  }

  async getMedicalReportById(id: number) {
    return this.model.findUnique({
      where: { id },
      include: {
        patient: true,
        studies: {
          include: {
            type: {
              include: { category: true },
            },
          },
        },
      },
    });
  }

  async updateMedicalReport(id: number, data: Prisma.MedicalReportUpdateInput) {
    return this.model.update({
      where: { id },
      data,
      include: { patient: true, studies: true },
    });
  }

  async deleteMedicalReport(id: number) {
    return this.model.delete({
      where: { id },
    });
  }
}
