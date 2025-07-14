import StudyType from './StudyType';
import MedicalReport from './MedicalReport';

export default class Study {
  id?: number;
  name: string;
  title: string;
  medicalReportId: number;
  studyTypeId: number;
  type?: StudyType;
  medicalReport?: MedicalReport;
  status?: string;

  constructor({ id, name, title, medicalReportId, studyTypeId, type, medicalReport, status }: {
    id?: number;
    name: string;
    title: string;
    medicalReportId: number;
    studyTypeId: number;
    type?: StudyType;
    medicalReport?: MedicalReport;
    status?: string;
  }) {
    if (id !== undefined) {
      this.id = id;
    }
    this.name = name;
    this.title = title;
    this.medicalReportId = medicalReportId;
    this.studyTypeId = studyTypeId;
    if (type !== undefined) {
      this.type = type;
    }
    if (medicalReport !== undefined) {
      this.medicalReport = medicalReport;
    }
    if (status !== undefined) {
      this.status = status;
    }
  }

  validate(): boolean {
    return !!(this.name && this.title && this.medicalReportId && this.studyTypeId);
  }

  updateStatus(status: string): void {
    this.status = status;
  }
}
