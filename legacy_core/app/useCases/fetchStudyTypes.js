// useCases/fetchStudyTypes.js
import StudyType from '../../../app/domain/entities/StudyType';

export async function fetchStudyTypes() {
  try {
    const response = await fetch('/api/study-types'); // Adjust the API endpoint as needed
    if (response.ok) {
      const data = await response.json();
      return data.map((studyType) =>
        new StudyType(studyType.id, studyType.name, studyType.description, studyType.categoryId, studyType.category)
      );
    } else {
      throw new Error('Error fetching study types');
    }
  } catch (error) {
    throw new Error('Error fetching study types: ' + error.message);
  }
}
