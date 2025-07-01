// studiesClient.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAllStudies() {
  return prisma.study.findMany({
    include: {
      category: true,
      medicalReport: true,
    }
  });
}

// Create a new study
export async function createStudy(data) {
  return prisma.study.create({
    data: {
      ...data,
      createdAt: new Date() // Automatically add the creation date
    },
  });
}

// Get a study by its ID
export async function getStudyById(id) {
  return prisma.study.findUnique({
    where: {
      id,
    },
    include: {
      type: true,
      medicalReport: true,
    },
  });
}

// Update a study by its ID
export async function updateStudy(id, data) {
  return prisma.study.update({
    where: {
      id,
    },
    data
  });
}

// Delete a study by its ID
export async function deleteStudy(id) {
  return prisma.study.delete({
    where: {
      id,
    },
  });
}
