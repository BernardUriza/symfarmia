import { APIProvider } from "./APIProvider";
import type { Repositories } from "../infrastructure/database/repositoryFactory";

export class LiveAPIProvider extends APIProvider {
  constructor(repos: Repositories) {
    super(repos);
  }

  async fetchPatients() {
    return this.repos.patients.getAllPatients();
  }

  async savePatient(patient: any) {
    if (patient.id) {
      await this.repos.patients.updatePatient(Number(patient.id), patient);
    } else {
      await this.repos.patients.createPatient(patient);
    }
    return { success: true };
  }

  async removePatient(patientId: any) {
    await this.repos.patients.deletePatient(Number(patientId));
    return { success: true };
  }

  async fetchMedicalReports() {
    return this.repos.medicalReports.getAllMedicalReports();
  }

  async fetchMedicalReport(reportId: any) {
    return this.repos.medicalReports.getMedicalReportById(Number(reportId));
  }

  async saveMedicalReport(report: any) {
    if (report.id) {
      await this.repos.medicalReports.updateMedicalReport(
        Number(report.id),
        report,
      );
    } else {
      await this.repos.medicalReports.createMedicalReport(report);
    }
    return { success: true };
  }

  async removeMedicalReport(reportId: any) {
    await this.repos.medicalReports.deleteMedicalReport(Number(reportId));
    return { success: true };
  }

  async fetchCategories() {
    return this.repos.categories.getAllCategories();
  }

  async saveCategory(category: any) {
    if (category.id) {
      await this.repos.categories.updateCategory(Number(category.id), category);
    } else {
      await this.repos.categories.createCategory(category);
    }
    return { success: true };
  }

  async fetchStudyTypes() {
    return this.repos.studyTypes.getAllStudyTypes();
  }

  async saveStudyType(studyType: any) {
    if (studyType.id) {
      await this.repos.studyTypes.updateStudyType(
        Number(studyType.id),
        studyType,
      );
    } else {
      await this.repos.studyTypes.createStudyType(studyType);
    }
    return { success: true };
  }

  async saveStudy(study: any) {
    if (study.id) {
      await this.repos.studies.updateStudy(Number(study.id), study);
    } else {
      await this.repos.studies.createStudy(study);
    }
    return { success: true };
  }

  async removeStudy(studyId: any) {
    await this.repos.studies.deleteStudy(Number(studyId));
    return { success: true };
  }

  async sendTokenByEmail(emailData: any) {
    try {
      const response = await fetch("/api/mailerHelper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error: any) {
      throw error;
    }
  }

  async mergePdfs(pdfData: any) {
    try {
      const response = await fetch("/api/mergePdfs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pdfData),
      });

      if (response.ok) {
        return await response.json();
      } else {
        return { success: false };
      }
    } catch (error: any) {
      throw error;
    }
  }
}
