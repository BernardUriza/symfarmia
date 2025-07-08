export const generateMockPatient = (id: number) => {
  const firstNames = ['Juan', 'Maria', 'Carlos', 'Ana', 'Pedro', 'Sofia', 'Luis', 'Carmen'];
  const lastNames = ['Garcia', 'Rodriguez', 'Martinez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez'];
  
  const firstName = firstNames[id % firstNames.length];
  const lastName = lastNames[id % lastNames.length];
  
  return {
    id: `patient-${id}`,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@demo.com`,
    phone: `+57 300 ${Math.floor(Math.random() * 9000000 + 1000000)}`,
    birthDate: new Date(1960 + Math.floor(Math.random() * 40), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString(),
    nationalId: `${Math.floor(Math.random() * 900000000 + 100000000)}`,
    address: `Calle ${Math.floor(Math.random() * 100)} #${Math.floor(Math.random() * 50)}-${Math.floor(Math.random() * 100)}`,
    city: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'][id % 5],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export const generateMockMedicalReport = (patientId: string, reportId: number) => {
  const diagnoses = ['Hipertensión', 'Diabetes tipo 2', 'Gastritis', 'Migraña', 'Anemia', 'Asma'];
  const symptoms = ['Dolor de cabeza', 'Fatiga', 'Mareo', 'Náuseas', 'Dolor abdominal', 'Fiebre'];
  
  return {
    id: `report-${reportId}`,
    patientId,
    diagnosis: diagnoses[reportId % diagnoses.length],
    symptoms: symptoms.filter(() => Math.random() > 0.5),
    medications: generateMockMedications(reportId),
    date: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
    doctorName: `Dr. ${['Martinez', 'Rodriguez', 'Garcia'][reportId % 3]}`,
    status: ['Activo', 'Completado', 'En progreso'][reportId % 3]
  };
};

export const generateMockMedications = (seed: number) => {
  const medications = [
    { name: 'Losartan', dosage: '50mg', frequency: '1 vez al día' },
    { name: 'Metformina', dosage: '850mg', frequency: '2 veces al día' },
    { name: 'Omeprazol', dosage: '20mg', frequency: '1 vez al día' },
    { name: 'Ibuprofeno', dosage: '400mg', frequency: 'Cada 8 horas' },
    { name: 'Salbutamol', dosage: '100mcg', frequency: 'Según necesidad' }
  ];
  
  const numMeds = Math.min(3, Math.floor(Math.random() * medications.length) + 1);
  return medications.slice(seed % medications.length, (seed % medications.length) + numMeds);
};