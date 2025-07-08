import React from 'react';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
}

interface DemoPatientSelectorProps {
  patients: Patient[];
  selectedPatient: string;
  onPatientChange: (patientId: string) => void;
}

export const DemoPatientSelector = ({ 
  patients, 
  selectedPatient, 
  onPatientChange 
}: DemoPatientSelectorProps) => {
  return (
    <div className="demo-patient-selector">
      <h3 className="font-semibold mb-2">Seleccionar Paciente</h3>
      <select 
        value={selectedPatient} 
        onChange={(e) => onPatientChange(e.target.value)}
        className="w-full p-2 border rounded-md"
      >
        <option value="">Seleccione un paciente</option>
        {patients.map(patient => (
          <option key={patient.id} value={patient.id}>
            {patient.name} - {patient.age} años ({patient.gender})
          </option>
        ))}
      </select>
    </div>
  );
};

export default DemoPatientSelector;