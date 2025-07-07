import { PatientRepository } from '../../app/infrastructure/repositories/PatientRepository';

describe('PatientRepository', () => {
  let prisma: any;
  let repo: PatientRepository;

  beforeEach(() => {
    prisma = {
      patient: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    repo = new PatientRepository(prisma as any);
  });

  it('getAllPatients orders by name', async () => {
    await repo.getAllPatients();
    expect(prisma.patient.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    });
  });

  it('createPatient forwards data', async () => {
    const data = { name: 'A', email: 'a@test.com', phone: '123', information: '', dateOfBirth: new Date(), gender: 'M', status: 'Activo' };
    await repo.createPatient(data as any);
    expect(prisma.patient.create).toHaveBeenCalledWith({ data: { ...data } });
  });

  it('getPatientById queries unique id', async () => {
    await repo.getPatientById(1);
    expect(prisma.patient.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('updatePatient updates record', async () => {
    const data = { status: 'Enviado' };
    await repo.updatePatient(1, data as any);
    expect(prisma.patient.update).toHaveBeenCalledWith({ where: { id: 1 }, data });
  });

  it('deletePatient removes record', async () => {
    await repo.deletePatient(1);
    expect(prisma.patient.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
