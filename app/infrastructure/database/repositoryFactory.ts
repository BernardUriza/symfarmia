import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export function createRepositoryFactory() {
  return {
    patients: {
      getAllPatients: () =>
        prisma.patient.findMany({ orderBy: { name: "asc" } }),
      createPatient: (data: any) => prisma.patient.create({ data }),
      getPatientById: (id: number) =>
        prisma.patient.findUnique({ where: { id } }),
      updatePatient: (id: number, data: any) =>
        prisma.patient.update({ where: { id }, data }),
      deletePatient: (id: number) => prisma.patient.delete({ where: { id } }),
    },
    medicalReports: {
      getAllMedicalReports: () =>
        prisma.medicalReport.findMany({
          include: {
            patient: true,
            studies: {
              include: {
                type: { include: { category: true } },
              },
            },
          },
          orderBy: { patient: { name: "asc" } },
        }),
      createMedicalReport: (data: any) =>
        prisma.medicalReport.create({
          data,
          include: { patient: true, studies: true },
        }),
      getMedicalReportById: (id: number) =>
        prisma.medicalReport.findUnique({
          where: { id },
          include: {
            patient: true,
            studies: {
              include: {
                type: { include: { category: true } },
              },
            },
          },
        }),
      updateMedicalReport: (id: number, data: any) =>
        prisma.medicalReport.update({
          where: { id },
          data,
          include: { patient: true, studies: true },
        }),
      deleteMedicalReport: (id: number) =>
        prisma.medicalReport.delete({ where: { id } }),
    },
    categories: {
      getAllCategories: () =>
        prisma.category.findMany({
          include: { studyTypes: { include: { category: true } } },
          orderBy: { name: "asc" },
        }),
      createCategory: (data: any) => prisma.category.create({ data }),
      getCategoryById: (id: number) =>
        prisma.category.findUnique({ where: { id } }),
      updateCategory: (id: number, data: any) =>
        prisma.category.update({ where: { id }, data }),
      deleteCategory: (id: number) => prisma.category.delete({ where: { id } }),
    },
    studyTypes: {
      getAllStudyTypes: () =>
        prisma.studyType.findMany({
          include: { category: true },
          orderBy: { name: "asc" },
        }),
      createStudyType: (data: any) => prisma.studyType.create({ data }),
      getStudyTypeById: (id: number) =>
        prisma.studyType.findUnique({ where: { id } }),
      updateStudyType: (id: number, data: any) =>
        prisma.studyType.update({ where: { id }, data }),
      deleteStudyType: (id: number) =>
        prisma.studyType.delete({ where: { id } }),
    },
    studies: {
      getAllStudies: () =>
        prisma.study.findMany({ include: { type: true, medicalReport: true } }),
      createStudy: (data: any) => prisma.study.create({ data }),
      getStudyById: (id: number) =>
        prisma.study.findUnique({
          where: { id },
          include: { type: true, medicalReport: true },
        }),
      updateStudy: (id: number, data: any) =>
        prisma.study.update({ where: { id }, data }),
      deleteStudy: (id: number) => prisma.study.delete({ where: { id } }),
    },
  };
}

export type Repositories = ReturnType<typeof createRepositoryFactory>;
