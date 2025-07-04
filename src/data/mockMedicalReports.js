export const mockMedicalReports = [
  {
    id: 1,
    patientId: 1,
    patient: {
      id: 1,
      name: "María González",
      email: "maria.gonzalez@email.com",
      phone: "+34 612 345 678",
      dateOfBirth: "1985-03-15",
      gender: "Femenino",
    },
    date: "2024-01-15",
    status: "Activo",
    diagnosis: "Diabetes mellitus tipo 2 controlada",
    expirationDate: "2024-01-30",
    studies: [
      {
        id: 1,
        name: "Hemoglobina glicosilada",
        result: "7.2%",
        status: "Completado",
        type: {
          id: 1,
          name: "Análisis de sangre",
          category: {
            id: 1,
            name: "Laboratorio"
          }
        },
        date: "2024-01-15",
        normalRange: "< 7.0%",
        notes: "Valor ligeramente elevado, ajustar medicación"
      },
      {
        id: 2,
        name: "Glucosa en ayunas",
        result: "126 mg/dL",
        status: "Completado",
        type: {
          id: 1,
          name: "Análisis de sangre",
          category: {
            id: 1,
            name: "Laboratorio"
          }
        },
        date: "2024-01-15",
        normalRange: "70-100 mg/dL",
        notes: "Valor elevado, continuar con dieta y ejercicio"
      }
    ],
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T09:00:00Z"
  },
  {
    id: 2,
    patientId: 2,
    patient: {
      id: 2,
      name: "Carlos Rodríguez",
      email: "carlos.rodriguez@email.com",
      phone: "+34 687 654 321",
      dateOfBirth: "1978-11-22",
      gender: "Masculino",
    },
    date: "2024-01-20",
    status: "Enviado",
    diagnosis: "Hipertensión arterial esencial",
    expirationDate: "2024-02-04",
    studies: [
      {
        id: 3,
        name: "Electrocardiograma",
        result: "Ritmo sinusal normal",
        status: "Completado",
        type: {
          id: 2,
          name: "Electrocardiograma",
          category: {
            id: 2,
            name: "Cardiología"
          }
        },
        date: "2024-01-20",
        normalRange: "Normal",
        notes: "No se observan alteraciones significativas"
      },
      {
        id: 4,
        name: "Presión arterial",
        result: "140/90 mmHg",
        status: "Completado",
        type: {
          id: 3,
          name: "Signos vitales",
          category: {
            id: 3,
            name: "Medicina general"
          }
        },
        date: "2024-01-20",
        normalRange: "< 120/80 mmHg",
        notes: "Hipertensión grado 1, continuar tratamiento"
      }
    ],
    createdAt: "2024-01-20T10:30:00Z",
    updatedAt: "2024-01-20T10:30:00Z"
  },
  {
    id: 3,
    patientId: 3,
    patient: {
      id: 3,
      name: "Ana Martínez",
      email: "ana.martinez@email.com",
      phone: "+34 634 567 890",
      dateOfBirth: "1992-07-08",
      gender: "Femenino",
    },
    date: "2024-01-25",
    status: "Pendiente",
    diagnosis: "Asma bronquial leve intermitente",
    expirationDate: "2024-02-09",
    studies: [
      {
        id: 5,
        name: "Espirometría",
        result: "FEV1: 85% del predicho",
        status: "Completado",
        type: {
          id: 4,
          name: "Prueba de función pulmonar",
          category: {
            id: 4,
            name: "Neumología"
          }
        },
        date: "2024-01-25",
        normalRange: "> 80% del predicho",
        notes: "Función pulmonar dentro del rango normal"
      },
      {
        id: 6,
        name: "Test de alergia",
        result: "Pendiente",
        status: "Pendiente",
        type: {
          id: 5,
          name: "Prueba de alergia",
          category: {
            id: 5,
            name: "Inmunología"
          }
        },
        date: "2024-01-25",
        normalRange: "Negativo",
        notes: "Programado para siguiente cita"
      }
    ],
    createdAt: "2024-01-25T14:15:00Z",
    updatedAt: "2024-01-25T14:15:00Z"
  },
  {
    id: 4,
    patientId: 4,
    patient: {
      id: 4,
      name: "José López",
      email: "jose.lopez@email.com",
      phone: "+34 698 123 456",
      dateOfBirth: "1965-12-03",
      gender: "Masculino",
    },
    date: "2024-01-10",
    status: "Inactivo",
    diagnosis: "Artritis reumatoide en remisión",
    expirationDate: "2024-01-25",
    studies: [
      {
        id: 7,
        name: "Factor reumatoide",
        result: "Positivo (45 IU/mL)",
        status: "Completado",
        type: {
          id: 6,
          name: "Análisis inmunológico",
          category: {
            id: 1,
            name: "Laboratorio"
          }
        },
        date: "2024-01-10",
        normalRange: "< 20 IU/mL",
        notes: "Valor elevado, consistente con artritis reumatoide"
      },
      {
        id: 8,
        name: "Velocidad de sedimentación",
        result: "15 mm/h",
        status: "Completado",
        type: {
          id: 1,
          name: "Análisis de sangre",
          category: {
            id: 1,
            name: "Laboratorio"
          }
        },
        date: "2024-01-10",
        normalRange: "< 20 mm/h",
        notes: "Valor normal, buena respuesta al tratamiento"
      }
    ],
    createdAt: "2024-01-10T11:45:00Z",
    updatedAt: "2024-01-10T11:45:00Z"
  },
  {
    id: 5,
    patientId: 5,
    patient: {
      id: 5,
      name: "Isabel Fernández",
      email: "isabel.fernandez@email.com",
      phone: "+34 657 890 123",
      dateOfBirth: "1988-05-20",
      gender: "Femenino",
    },
    date: "2024-01-28",
    status: "Activo",
    diagnosis: "Migraña crónica con aura",
    expirationDate: "2024-02-12",
    studies: [
      {
        id: 9,
        name: "Resonancia magnética cerebral",
        result: "Sin lesiones estructurales",
        status: "Completado",
        type: {
          id: 7,
          name: "Resonancia magnética",
          category: {
            id: 6,
            name: "Radiología"
          }
        },
        date: "2024-01-28",
        normalRange: "Normal",
        notes: "Estructura cerebral normal, descartar causas orgánicas"
      },
      {
        id: 10,
        name: "Electroencefalograma",
        result: "Actividad normal",
        status: "Completado",
        type: {
          id: 8,
          name: "Electroencefalograma",
          category: {
            id: 7,
            name: "Neurología"
          }
        },
        date: "2024-01-28",
        normalRange: "Normal",
        notes: "No se observan alteraciones eléctricas cerebrales"
      }
    ],
    createdAt: "2024-01-28T16:20:00Z",
    updatedAt: "2024-01-28T16:20:00Z"
  },
  {
    id: 6,
    patientId: 1,
    patient: {
      id: 1,
      name: "María González",
      email: "maria.gonzalez@email.com",
      phone: "+34 612 345 678",
      dateOfBirth: "1985-03-15",
      gender: "Femenino",
    },
    date: "2024-02-01",
    status: "Borrador",
    diagnosis: "Control rutinario diabetes",
    expirationDate: "2024-02-16",
    studies: [
      {
        id: 11,
        name: "Hemoglobina glicosilada",
        result: "En proceso",
        status: "En proceso",
        type: {
          id: 1,
          name: "Análisis de sangre",
          category: {
            id: 1,
            name: "Laboratorio"
          }
        },
        date: "2024-02-01",
        normalRange: "< 7.0%",
        notes: "Control trimestral programado"
      }
    ],
    createdAt: "2024-02-01T08:30:00Z",
    updatedAt: "2024-02-01T08:30:00Z"
  }
];

export const mockStudyTypes = [
  {
    id: 1,
    name: "Análisis de sangre",
    category: {
      id: 1,
      name: "Laboratorio"
    }
  },
  {
    id: 2,
    name: "Electrocardiograma",
    category: {
      id: 2,
      name: "Cardiología"
    }
  },
  {
    id: 3,
    name: "Signos vitales",
    category: {
      id: 3,
      name: "Medicina general"
    }
  },
  {
    id: 4,
    name: "Prueba de función pulmonar",
    category: {
      id: 4,
      name: "Neumología"
    }
  },
  {
    id: 5,
    name: "Prueba de alergia",
    category: {
      id: 5,
      name: "Inmunología"
    }
  },
  {
    id: 6,
    name: "Análisis inmunológico",
    category: {
      id: 1,
      name: "Laboratorio"
    }
  },
  {
    id: 7,
    name: "Resonancia magnética",
    category: {
      id: 6,
      name: "Radiología"
    }
  },
  {
    id: 8,
    name: "Electroencefalograma",
    category: {
      id: 7,
      name: "Neurología"
    }
  }
];