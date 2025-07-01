// useCases/removeMedicalReport.js
export async function removeMedicalReport(id) {
    try {
      const response = await fetch(`/api/medicalReports/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const deletedReport = await response.json();
        return { success: true, deletedReport };
      } else {
        console.error('Error removing medical report:', response.status);
        throw new Error('Error removing medical report');
      }
    } catch (error) {
      console.error('Error removing medical report:', error.message);
      throw error;
    }
  }
  