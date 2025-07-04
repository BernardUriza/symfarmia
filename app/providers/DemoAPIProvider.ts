import { APIProvider } from "./APIProvider";
import type { Repositories } from "../infrastructure/database/repositoryFactory";

export class DemoAPIProvider extends APIProvider {
  private demoData: any;

  constructor(repos: Repositories) {
    super(repos);
    this.demoData = this.initializeDemoData();
    if (process.env.NEXT_PUBLIC_DEMO_SYNC === "true") {
      this.synchronizeWithLive();
    }
  }

  async synchronizeWithLive(): Promise<void> {
    try {
      const { LiveAPIProvider } = await import("./LiveAPIProvider");
      const live = new LiveAPIProvider(this.repos);
      const patients = await live.fetchPatients();
      if (Array.isArray(patients)) {
        this.demoData.patients = patients as unknown[];
      }
    } catch (error: any) {
      console.warn("[DEMO MODE] Live sync failed:", error);
    }
  }

  initializeDemoData(): any {
    return {
      patients: [
        {
          id: 1,
          name: "Dr. John Smith",
          dateOfBirth: "1985-03-15",
          email: "john.smith@demo.com",
          phone: "+1-555-0123",
          address: "123 Demo Street, Demo City, DC 12345",
          medicalHistory: "No significant medical history",
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T10:30:00Z",
        },
        {
          id: 2,
          name: "Dr. Sarah Johnson",
          dateOfBirth: "1990-07-22",
          email: "sarah.johnson@demo.com",
          phone: "+1-555-0124",
          address: "456 Demo Avenue, Demo City, DC 12346",
          medicalHistory: "Allergic to penicillin",
          createdAt: "2024-01-16T14:20:00Z",
          updatedAt: "2024-01-16T14:20:00Z",
        },
        {
          id: 3,
          name: "Dr. Michael Brown",
          dateOfBirth: "1978-11-30",
          email: "michael.brown@demo.com",
          phone: "+1-555-0125",
          address: "789 Demo Boulevard, Demo City, DC 12347",
          medicalHistory: "Hypertension, diabetes type 2",
          createdAt: "2024-01-17T09:15:00Z",
          updatedAt: "2024-01-17T09:15:00Z",
        },
      ],
      medicalReports: [
        {
          id: 1,
          patientId: 1,
          diagnosis: "Annual Health Checkup",
          date: "2024-06-15",
          status: "completed",
          notes: "Patient in excellent health. All vital signs normal.",
          createdAt: "2024-06-15T10:00:00Z",
          updatedAt: "2024-06-15T10:00:00Z",
        },
        {
          id: 2,
          patientId: 2,
          diagnosis: "Flu Symptoms",
          date: "2024-06-20",
          status: "completed",
          notes:
            "Patient presented with fever and body aches. Prescribed rest and fluids.",
          createdAt: "2024-06-20T14:30:00Z",
          updatedAt: "2024-06-20T14:30:00Z",
        },
        {
          id: 3,
          patientId: 3,
          diagnosis: "Diabetes Management",
          date: "2024-06-25",
          status: "in_progress",
          notes:
            "Regular diabetes checkup. Blood sugar levels slightly elevated.",
          createdAt: "2024-06-25T11:15:00Z",
          updatedAt: "2024-06-25T11:15:00Z",
        },
      ],
      categories: [
        {
          id: 1,
          name: "Cardiology",
          description: "Heart and cardiovascular system",
        },
        {
          id: 2,
          name: "Endocrinology",
          description: "Hormone and metabolic disorders",
        },
        {
          id: 3,
          name: "General Medicine",
          description: "General health and wellness",
        },
        { id: 4, name: "Neurology", description: "Nervous system disorders" },
      ],
      studyTypes: [
        { id: 1, categoryId: 1, name: "ECG", description: "Electrocardiogram" },
        {
          id: 2,
          categoryId: 1,
          name: "Echocardiogram",
          description: "Heart ultrasound",
        },
        {
          id: 3,
          categoryId: 2,
          name: "Blood Glucose",
          description: "Blood sugar test",
        },
        {
          id: 4,
          categoryId: 2,
          name: "HbA1c",
          description: "Long-term blood sugar control",
        },
        {
          id: 5,
          categoryId: 3,
          name: "Complete Blood Count",
          description: "Full blood panel",
        },
        {
          id: 6,
          categoryId: 4,
          name: "Brain MRI",
          description: "Magnetic resonance imaging of brain",
        },
      ],
      studies: [
        {
          id: 1,
          medicalReportId: 1,
          studyTypeId: 5,
          result: "Normal",
          notes: "All blood values within normal range",
          date: "2024-06-15",
        },
        {
          id: 2,
          medicalReportId: 3,
          studyTypeId: 3,
          result: "Elevated",
          notes: "Blood glucose: 180 mg/dL (target: <130 mg/dL)",
          date: "2024-06-25",
        },
      ],
    };
  }

  async fetchPatients() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.demoData.patients);
      }, 500);
    });
  }

  async savePatient(patient: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (patient.id) {
          const index = this.demoData.patients.findIndex(
            (p: any) => p.id === patient.id,
          );
          if (index !== -1) {
            this.demoData.patients[index] = {
              ...patient,
              updatedAt: new Date().toISOString(),
            };
          }
        } else {
          const newPatient = {
            ...patient,
            id: Math.max(...this.demoData.patients.map((p: any) => p.id)) + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          this.demoData.patients.push(newPatient);
        }
        resolve({ success: true });
      }, 300);
    });
  }

  async removePatient(patientId: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.demoData.patients = this.demoData.patients.filter(
          (p: any) => p.id !== patientId,
        );
        this.demoData.medicalReports = this.demoData.medicalReports.filter(
          (r: any) => r.patientId !== patientId,
        );
        resolve({ success: true });
      }, 300);
    });
  }

  async fetchMedicalReports() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.demoData.medicalReports);
      }, 500);
    });
  }

  async fetchMedicalReport(reportId: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const report = this.demoData.medicalReports.find(
          (r: any) => r.id === parseInt(reportId),
        );
        resolve(report || null);
      }, 300);
    });
  }

  async saveMedicalReport(report: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (report.id) {
          const index = this.demoData.medicalReports.findIndex(
            (r: any) => r.id === report.id,
          );
          if (index !== -1) {
            this.demoData.medicalReports[index] = {
              ...report,
              updatedAt: new Date().toISOString(),
            };
          }
        } else {
          const newReport = {
            ...report,
            id:
              Math.max(...this.demoData.medicalReports.map((r: any) => r.id)) +
              1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          this.demoData.medicalReports.push(newReport);
        }
        resolve({ success: true });
      }, 300);
    });
  }

  async removeMedicalReport(reportId: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.demoData.medicalReports = this.demoData.medicalReports.filter(
          (r: any) => r.id !== reportId,
        );
        this.demoData.studies = this.demoData.studies.filter(
          (s: any) => s.medicalReportId !== reportId,
        );
        resolve({ success: true });
      }, 300);
    });
  }

  async fetchCategories() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.demoData.categories);
      }, 300);
    });
  }

  async saveCategory(category: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (category.id) {
          const index = this.demoData.categories.findIndex(
            (c: any) => c.id === category.id,
          );
          if (index !== -1) {
            this.demoData.categories[index] = category;
          }
        } else {
          const newCategory = {
            ...category,
            id: Math.max(...this.demoData.categories.map((c: any) => c.id)) + 1,
          };
          this.demoData.categories.push(newCategory);
        }
        resolve({ success: true });
      }, 300);
    });
  }

  async fetchStudyTypes() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.demoData.studyTypes);
      }, 300);
    });
  }

  async saveStudyType(studyType: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (studyType.id) {
          const index = this.demoData.studyTypes.findIndex(
            (st: any) => st.id === studyType.id,
          );
          if (index !== -1) {
            this.demoData.studyTypes[index] = studyType;
          }
        } else {
          const newStudyType = {
            ...studyType,
            id:
              Math.max(...this.demoData.studyTypes.map((st: any) => st.id)) + 1,
          };
          this.demoData.studyTypes.push(newStudyType);
        }
        resolve({ success: true });
      }, 300);
    });
  }

  async saveStudy(study: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (study.id) {
          const index = this.demoData.studies.findIndex(
            (s: any) => s.id === study.id,
          );
          if (index !== -1) {
            this.demoData.studies[index] = study;
          }
        } else {
          const newStudy = {
            ...study,
            id: Math.max(...this.demoData.studies.map((s: any) => s.id)) + 1,
          };
          this.demoData.studies.push(newStudy);
        }
        resolve({ success: true });
      }, 300);
    });
  }

  async removeStudy(studyId: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.demoData.studies = this.demoData.studies.filter(
          (s: any) => s.id !== studyId,
        );
        resolve({ success: true });
      }, 300);
    });
  }

  async sendTokenByEmail(emailData: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("[DEMO MODE] Email would be sent:", emailData);
        resolve({ success: true, message: "Demo: Email sent successfully" });
      }, 1000);
    });
  }

  async mergePdfs(pdfData: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("[DEMO MODE] PDFs would be merged:", pdfData);
        resolve({
          success: true,
          url: "demo-merged-document.pdf",
          message: "Demo: PDFs merged successfully",
        });
      }, 1500);
    });
  }
}
