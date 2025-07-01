export async function saveStudyType(editedStudyType) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('/api/study-types', { // Replace '/api/studytypes' with the actual API endpoint for saving study types
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editedStudyType),
        });

        if (response.ok) {
          // The request was successful, you can perform additional actions if needed
          console.log('StudyType data saved successfully.');
          resolve({ success: true });
        } else {
          // The request was not successful, handle the error
          console.error('Error while saving StudyType data.');
          reject({ response });
        }
      } catch (error) {
        console.error('Error while saving StudyType data: ' + error.message);
        reject(error);
      }
    });
  }
  