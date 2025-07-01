export async function saveStudy(editedStudy) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('/api/studies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editedStudy),
        });
  
        if (response.ok) {
          // La solicitud fue exitosa, puedes realizar acciones adicionales si es necesario
          console.log('El estudio fue guardado exitosamente.');
          resolve({ success: true });
        } else {
          // La solicitud no fue exitosa, maneja el error
          console.error('Error al guardar el estudio.');
          resolve({ success: false });
        }
      } catch (error) {
        reject(error);
      }
    });
  }
  