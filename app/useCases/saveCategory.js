export async function saveCategory(editedCategory) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('/api/categories', { // Replace '/api/categories' with the actual API endpoint for saving categories
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editedCategory),
        });
  
        if (response.ok) {
          // The request was successful, you can perform additional actions if needed
          console.log('Category data saved successfully.');
          resolve({ success: true });
        } else {
          // The request was not successful, handle the error
          console.error('Error while saving category data.');
          resolve({ success: false });
        }
      } catch (error) {
        console.error('Error while saving category data: ' + error.message);
        reject(error);
      }
    });
  }
  