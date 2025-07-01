export async function removeStudy(studyId) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`/api/studies/${studyId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (response.ok) {
          // La solicitud fue exitosa, puedes realizar acciones adicionales si es necesario
          console.log('El estudio fue eliminado exitosamente.');
          resolve({ success: true });
        } else {
          // La solicitud no fue exitosa, maneja el error
          console.error('Error al eliminar el estudio.');
          resolve({ success: false });
        }
      } catch (error) {
        console.error('Error al intentar eliminar el estudio:', error);
        reject(error);
      }
    });
}
