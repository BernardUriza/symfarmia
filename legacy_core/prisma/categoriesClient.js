import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todas las categorías
export async function getAllCategories() {
  return prisma.category.findMany({
    include: {
      studyTypes: {
        include: {
          category: true
        }
      }
    },
    orderBy: { 
      name: "asc"
     }
  });
}

// Crear una nueva categoría
export async function createCategory(data) {
  return prisma.category.create({
    data: {
      ...data,
    },
  });
}

// Obtener una categoría por su ID
export async function getCategoryById(id) {
  return prisma.category.findUnique({
    where: {
      id,
    },
  });
}

// Actualizar una categoría por su ID
export async function updateCategory(id, data) {
  return prisma.category.update({
    where: {
      id,
    },
    data,
  });
}

// Eliminar una categoría por su ID
export async function deleteCategory(id) {
  return prisma.category.delete({
    where: {
      id,
    },
  });
}
