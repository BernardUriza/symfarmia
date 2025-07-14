export default class Category {
  id: number;
  name: string;
  studyTypes?: unknown[];

  constructor(id: number, name: string, studyTypes?: unknown[]) {
    this.id = id;
    this.name = name;
    if (studyTypes !== undefined) {
      this.studyTypes = studyTypes;
    }
  }
}
