import { useState, useEffect } from 'react';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  medicalHistory?: string[];
}

export const useDemoPatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading patients
    setTimeout(() => {
      setPatients([
        {
          id: '1',
          name: 'María González',
          age: 45,
          gender: 'Femenino',
          medicalHistory: ['Hipertensión', 'Diabetes tipo 2']
        },
        {
          id: '2',
          name: 'Juan Pérez',
          age: 32,
          gender: 'Masculino',
          medicalHistory: ['Asma']
        },
        {
          id: '3',
          name: 'Ana Rodríguez',
          age: 28,
          gender: 'Femenino',
          medicalHistory: []
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const selectPatient = (patientId: string) => {
    setSelectedPatient(patientId);
  };

  const getSelectedPatient = () => {
    return patients.find(p => p.id === selectedPatient);
  };

  return {
    patients,
    selectedPatient,
    loading,
    selectPatient,
    getSelectedPatient
  };
};

export default useDemoPatients;