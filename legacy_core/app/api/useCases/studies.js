import { getAllStudies, createStudy, updateStudy, getStudyById, deleteStudy } from '../../../prisma/studiesClient';

export async function fetchStudies() {
  return await getAllStudies();
}

export async function fetchStudy(id) {
  return await getStudyById(id);
}

export async function saveStudy(data) {
  const { id, ...rest } = data;
  const existing = id ? await getStudyById(id) : null;
  if (existing) {
    const study = await updateStudy(id, rest);
    return { study, created: false };
  }
  const study = await createStudy(rest);
  return { study, created: true };
}

export async function removeStudy(id) {
  return await deleteStudy(id);
}
