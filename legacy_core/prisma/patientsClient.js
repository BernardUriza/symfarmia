import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todos los pacientes
export async function getAllPatients() {
  return prisma.patient.findMany({
    orderBy: {
      name: 'asc',
    },
  });
}

// Crear un nuevo paciente
export async function createPatient(data) {
  return prisma.patient.create({
    data: {
      ...data,
    },
  });
}

// Obtener un paciente por su ID
export async function getPatientById(id) {
  return prisma.patient.findUnique({
    where: {
      id,
    },
  });
}

// Actualizar un paciente por su ID
export async function updatePatient(id, data) {
  return prisma.patient.update({
    where: {
      id,
    },
    data,
  });
}

// Eliminar un paciente por su ID
export async function deletePatient(id) {
  return prisma.patient.delete({
    where: {
      id,
    },
  });
}

// Add any other patient-related functions you need here

export default {
  getAllPatients,
  createPatient,
  getPatientById,
  updatePatient,
  deletePatient,
};
