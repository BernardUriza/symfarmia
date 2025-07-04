// useCases/fetchPatients.js
import Patient from '../../app/domain/entities/Patient';

export async function fetchPatients() {
    try {
        const response = await fetch('/api/patients'); // Adjust the API endpoint URL
        if (response.ok) {
            const data = await response.json();
            return data.map((patient) =>
                new Patient(patient)
            );
        } else {
            throw new Error('Error fetching patients');
        }
    } catch (error) {
        throw new Error('Error fetching patients: ' + error.message);
    }
}
