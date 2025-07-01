// useCases/removePatient.js

/**
 * Removes a patient by its ID.
 * 
 * @param {string | number} id The ID of the patient to be deleted.
 * @returns {Promise<{success: boolean, deletedReport?: any}>} 
 *          A promise that resolves to an object indicating the success status 
 *          and the deleted report data, if successful.
 * @throws {Error} If there's an error during the deletion process.
 */
export async function removePatient(id) {
    try {
        const response = await fetch(`/api/patients/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const deletedReport = await response.json();
            return { success: true, deletedReport };
        } else {
            console.error('Error removing patient:', response.status);
            throw new Error('Error removing patient');
        }
    } catch (error) {
        console.error('Error removing patient:', error.message);
        throw error;
    }
}
