import { MedicalReportRepository } from '../../app/infrastructure/repositories/MedicalReportRepository';

describe('MedicalReportRepository', () => {
  let prisma: any;
  let repo: MedicalReportRepository;

  beforeEach(() => {
    prisma = {
      medicalReport: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    repo = new MedicalReportRepository(prisma as any);
    jest.useFakeTimers().setSystemTime(new Date('2024-01-02'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('getAllMedicalReports marks expired active reports as sent', async () => {
    const reports = [
      { id: 1, status: 'Activo', expirationDate: new Date('2024-01-01'), patient: {}, studies: [] },
      { id: 2, status: 'Enviado', expirationDate: new Date('2024-01-03'), patient: {}, studies: [] },
    ];
    prisma.medicalReport.findMany.mockResolvedValue(reports);

    const result = await repo.getAllMedicalReports();
    expect(prisma.medicalReport.findMany).toHaveBeenCalledWith({
      include: {
        patient: true,
        studies: { include: { type: { include: { category: true } } } },
      },
      orderBy: { patient: { name: 'asc' } },
    });
    expect(result[0].status).toBe('Enviado');
    expect(result[1].status).toBe('Enviado');
  });

  it('createMedicalReport adds createdAt and includes relations', async () => {
    const data = { name: 'R', status: 'Activo', date: new Date('2024-01-01'), patientId: 1 } as any;
    await repo.createMedicalReport(data);
    const call = prisma.medicalReport.create.mock.calls[0][0];
    expect(call.data.name).toBe('R');
    expect(call.data.createdAt).toBeInstanceOf(Date);
    expect(call.include).toEqual({ patient: true, studies: true });
  });

  it('getMedicalReportById includes nested relations', async () => {
    await repo.getMedicalReportById(1);
    expect(prisma.medicalReport.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: {
        patient: true,
        studies: { include: { type: { include: { category: true } } } },
      },
    });
  });

  it('updateMedicalReport updates and returns relations', async () => {
    await repo.updateMedicalReport(1, { status: 'Enviado' } as any);
    expect(prisma.medicalReport.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: 'Enviado' },
      include: { patient: true, studies: true },
    });
  });

  it('deleteMedicalReport removes record', async () => {
    await repo.deleteMedicalReport(1);
    expect(prisma.medicalReport.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
