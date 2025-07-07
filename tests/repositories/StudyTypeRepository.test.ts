import { StudyTypeRepository } from '../../app/infrastructure/repositories/StudyTypeRepository';

describe('StudyTypeRepository', () => {
  let prisma: any;
  let repo: StudyTypeRepository;

  beforeEach(() => {
    prisma = {
      studyType: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    repo = new StudyTypeRepository(prisma as any);
  });

  it('getAllStudyTypes includes category', async () => {
    await repo.getAllStudyTypes();
    expect(prisma.studyType.findMany).toHaveBeenCalledWith({
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  });

  it('createStudyType forwards data', async () => {
    const data = { name: 'X', description: 'desc', categoryId: 1 };
    await repo.createStudyType(data as any);
    expect(prisma.studyType.create).toHaveBeenCalledWith({ data: { ...data } });
  });

  it('getStudyTypeById queries by id', async () => {
    await repo.getStudyTypeById(1);
    expect(prisma.studyType.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('updateStudyType updates record', async () => {
    await repo.updateStudyType(1, { name: 'New' } as any);
    expect(prisma.studyType.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { name: 'New' } });
  });

  it('deleteStudyType removes record', async () => {
    await repo.deleteStudyType(1);
    expect(prisma.studyType.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
