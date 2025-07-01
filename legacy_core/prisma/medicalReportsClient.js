import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAllMedicalReports() {
  const currentDate = new Date();

  const medicalReports = await prisma.medicalReport.findMany({
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

  // Update the status of each medical report based on the expirationDate
  const updatedMedicalReports = medicalReports.map((report) => {
    const expirationDate = new Date(report.expirationDate); // Assuming there is an expirationDate column
    const isActive = report.status == "Activo"

    if (currentDate > expirationDate && isActive) {
      // If the current date is greater than the expiration date, update the status to 'enviado'
      return {
        ...report,
        status: 'Enviado',
      };
    }

    return report; // No need to update the status
  });

  return updatedMedicalReports;
}


// Crear un nuevo reporte médico
export async function createMedicalReport(data) {
  return prisma.medicalReport.create({
    data: {
      ...data,
      createdAt: new Date() // Agrega la fecha de creación automáticamente
    },
    include: {
      patient: true,
      studies: true
    },
  });
}

// Obtener un reporte médico por su ID
export async function getMedicalReportById(id) {
  return prisma.medicalReport.findUnique({
    where: {
      id,
    },
    include: {
      patient: true,
      studies: {
        include: {
          type: {
            include: {
              category: true
            }
          }
        }
      }
    },
  });
}

// Actualizar un reporte médico por su ID
export async function updateMedicalReport(id, data) {
  return prisma.medicalReport.update({
    where: {
      id,
    },
    data,
    include: {
      patient: true,
      studies: true
    },
  });
}

// Eliminar un reporte médico por su ID
export async function deleteMedicalReport(id) {
  return prisma.medicalReport.delete({
    where: {
      id,
    },
  });
}
