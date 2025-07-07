import { PrismaClient } from '@prisma/client';
import { PatientRepository } from '../repositories/PatientRepository';
import { MedicalReportRepository } from '../repositories/MedicalReportRepository';
import { StudyTypeRepository } from '../repositories/StudyTypeRepository';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { StudyRepository } from '../repositories/StudyRepository';

export interface Database {
  prisma: PrismaClient;
  patientRepository: PatientRepository;
  medicalReportRepository: MedicalReportRepository;
  studyTypeRepository: StudyTypeRepository;
  categoryRepository: CategoryRepository;
  studyRepository: StudyRepository;
}

export function createDatabase(): Database {
  const globalForPrisma = global as unknown as { prisma?: PrismaClient };
  const prisma = globalForPrisma.prisma || new PrismaClient();
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }
  return {
    prisma,
    patientRepository: new PatientRepository(prisma),
    medicalReportRepository: new MedicalReportRepository(prisma),
    studyTypeRepository: new StudyTypeRepository(prisma),
    categoryRepository: new CategoryRepository(prisma),
    studyRepository: new StudyRepository(prisma),
  };
}
