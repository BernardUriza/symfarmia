import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todos los tipos de estudio
export async function getAllStudyTypes() {
  return prisma.studyType.findMany({
    include: {
      category: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
}

// Crear un nuevo tipo de estudio
export async function createStudyType(data) {
  return prisma.studyType.create({
    data: {
      ...data,
    },
  });
}

// Obtener un tipo de estudio por su ID
export async function getStudyTypeById(id) {
  return prisma.studyType.findUnique({
    where: {
      id,
    },
  });
}

// Actualizar un tipo de estudio por su ID
export async function updateStudyType(id, data) {
  return prisma.studyType.update({
    where: {
      id,
    },
    data,
  });
}

// Eliminar un tipo de estudio por su ID
export async function deleteStudyType(id) {
  return prisma.studyType.delete({
    where: {
      id,
    },
  });
}

export default {
  getAllStudyTypes,
  createStudyType,
  getStudyTypeById,
  updateStudyType,
  deleteStudyType,
};
