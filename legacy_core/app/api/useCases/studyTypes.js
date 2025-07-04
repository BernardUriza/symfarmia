import { getAllStudyTypes, createStudyType, updateStudyType, getStudyTypeById } from '../../../prisma/studyTypesClient';

export async function fetchStudyTypes() {
  return await getAllStudyTypes();
}

export async function saveStudyType(data) {
  const { id, name, description, categoryId } = data;
  const existing = await getStudyTypeById(id);
  if (existing) {
    const studyType = await updateStudyType(id, { name, description, categoryId });
    return { studyType, created: false };
  }
  const studyType = await createStudyType({ id, name, description, categoryId });
  return { studyType, created: true };
}
