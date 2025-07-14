import { StudyType, CreateStudyTypeData, UpdateStudyTypeData } from '@/types';
import { BaseRepository } from '../BaseRepository';

export interface IStudyTypeRepository extends BaseRepository<
  StudyType,
  CreateStudyTypeData,
  UpdateStudyTypeData
> {}
