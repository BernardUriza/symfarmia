import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.patient.create({
    data: {
      name: 'Demo Patient',
      email: 'demo@example.com',
      phone: '555-1234',
      information: 'Demo record',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'MALE',
      status: 'active',
      firstName: 'Demo',
      lastName: 'Patient',
      documentType: 'CEDULA',
      documentNumber: '12345678',
      bloodType: 'O_POSITIVE',
      isActive: true,
    } as any,
  });
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
