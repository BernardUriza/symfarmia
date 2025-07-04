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
    this.id = id;
    this.name = name;
    this.title = title;
    this.medicalReportId = medicalReportId;
    this.studyTypeId = studyTypeId;
    this.type = type;
    this.medicalReport = medicalReport;
    this.status = status;
  }

  validate(): boolean {
    return !!(this.name && this.title && this.medicalReportId && this.studyTypeId);
  }

  updateStatus(status: string): void {
    this.status = status;
  }
}
