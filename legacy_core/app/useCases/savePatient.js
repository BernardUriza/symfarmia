export async function savePatient(editedPatient) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('/api/patients', { // Replace '/api/patients' with the actual API endpoint for saving patients
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editedPatient),
        });
  
        if (response.ok) {
          // The request was successful, you can perform additional actions if needed
          console.log('Patient data saved successfully.');
          resolve({ success: true });
        } else {
          // The request was not successful, handle the error
          console.error('Error while saving patient data.');
          resolve({ success: false });
        }
      } catch (error) {
        console.error('Error while saving patient data: ' + error.message);
        reject(error);
      }
    });
  }
  