import { APIProvider } from './APIProvider.js';

export class LiveAPIProvider extends APIProvider {
  async fetchPatients() {
    try {
      const response = await fetch('/api/patients');
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Error fetching patients');
      }
    } catch (error) {
      throw new Error('Error fetching patients: ' + error.message);
    }
  }

  async savePatient(patient) {
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patient),
      });

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      throw error;
    }
  }

  async removePatient(patientId) {
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      throw error;
    }
  }

  async fetchMedicalReports() {
    try {
      const response = await fetch('/api/medicalReports');
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Error fetching medical reports');
      }
    } catch (error) {
      throw new Error('Error fetching medical reports: ' + error.message);
    }
  }

  async fetchMedicalReport(reportId) {
    try {
      const response = await fetch(`/api/medicalReports/${reportId}`);
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Error fetching medical report');
      }
    } catch (error) {
      throw new Error('Error fetching medical report: ' + error.message);
    }
  }

  async saveMedicalReport(report) {
    try {
      const response = await fetch('/api/medicalReports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      throw error;
    }
  }

  async removeMedicalReport(reportId) {
    try {
      const response = await fetch(`/api/medicalReports/${reportId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      throw error;
    }
  }

  async fetchCategories() {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Error fetching categories');
      }
    } catch (error) {
      throw new Error('Error fetching categories: ' + error.message);
    }
  }

  async saveCategory(category) {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      });

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      throw error;
    }
  }

  async fetchStudyTypes() {
    try {
      const response = await fetch('/api/study-types');
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Error fetching study types');
      }
    } catch (error) {
      throw new Error('Error fetching study types: ' + error.message);
    }
  }

  async saveStudyType(studyType) {
    try {
      const response = await fetch('/api/study-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studyType),
      });

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      throw error;
    }
  }

  async saveStudy(study) {
    try {
      const response = await fetch('/api/studies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(study),
      });

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      throw error;
    }
  }

  async removeStudy(studyId) {
    try {
      const response = await fetch(`/api/studies/${studyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      throw error;
    }
  }

  async sendTokenByEmail(emailData) {
    try {
      const response = await fetch('/api/mailerHelper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      throw error;
    }
  }

  async mergePdfs(pdfData) {
    try {
      const response = await fetch('/api/mergePdfs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pdfData),
      });

      if (response.ok) {
        return await response.json();
      } else {
        return { success: false };
      }
    } catch (error) {
      throw error;
    }
  }
}