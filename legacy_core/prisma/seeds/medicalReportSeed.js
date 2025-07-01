/**
 * Prisma database seeding script
 * Run with: node .\prisma\seeds\medicalReportSeed.js
 */
const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

const statusOptions = ["Activo", "Enviado", "Pendiente", "No entregado"];

const estudiosCardiologicos = [
  {
    nombre: "Holter 24 Horas",
    descripcion: "Monitoreo continuo del corazón durante 24 horas para obtener una visión completa de su actividad. Detectamos irregularidades que podrían pasar desapercibidas."
  },
  {
    nombre: "Holter de 48 Horas",
    descripcion: "Extiende el monitoreo a 48 horas para obtener información adicional sobre la actividad cardíaca. Evaluar patrones durante un período más prolongado."
  },
  {
    nombre: "Mapa de 24 Horas",
    descripcion: "Registro continuo de la presión arterial durante un día para analizar las variaciones y brindar un diagnóstico más preciso."
  },
  {
    nombre: "Electrocardiograma",
    descripcion: "Capturamos la actividad eléctrica de tu corazón para identificar irregularidades y evaluar su funcionamiento."
  },
  {
    nombre: "Espirometría",
    descripcion: "Medimos tu función pulmonar para comprender mejor cómo tu sistema respiratorio afecta tu salud cardiovascular."
  },
  {
    nombre: "Poligrafía Respiratoria",
    descripcion: "Evaluamos tu sistema respiratorio durante el sueño, detectando posibles apneas y problemas respiratorios que podrían afectar tu salud cardíaca."
  }
];
const estudiosUltrasonido = [
  {
    nombre: "Ultrasonido Abdominal",
    descripcion: "Obtén imágenes detalladas de los órganos en tu abdomen para evaluar su salud y detectar posibles problemas."
  },
  {
    nombre: "Ultrasonido Renal",
    descripcion: "Evaluación minuciosa de tus riñones, identificando irregularidades que puedan afectar tu bienestar."
  },
  {
    nombre: "Ultrasonido Prostático",
    descripcion: "Crucial para la salud masculina, este estudio detecta problemas de próstata en sus primeras etapas. *Estudio en Consultorio."
  },
  {
    nombre: "Ultrasonido Ginecológico",
    descripcion: "Proporciona una evaluación completa de la salud reproductiva y ginecológica de la mujer. *Estudio en Consultorio."
  },
  {
    nombre: "Ultrasonido Obstétrico",
    descripcion: "Observa el desarrollo y bienestar de tu bebé durante el embarazo con imágenes claras y detalladas. *Estudio en Consultorio."
  },
  {
    nombre: "Ultrasonido Abdomen Total",
    descripcion: "Imágenes completas de tu abdomen para una evaluación exhaustiva de tus órganos internos."
  },
  {
    nombre: "Ultrasonido 'FAST'",
    descripcion: "Este estudio rápido y focalizado se utiliza en situaciones de emergencia para evaluar lesiones internas."
  },
  {
    nombre: "Ultrasonido Piloro",
    descripcion: "Ayuda en la detección de problemas gastrointestinales, especialmente en bebés."
  },
  {
    nombre: "Ultrasonido Tiroideo",
    descripcion: "Evalúa la salud de tu glándula tiroides y detecta trastornos tempranos."
  },
  {
    nombre: "Ultrasonido de Cuello",
    descripcion: "Proporciona imágenes claras del cuello para detectar problemas de tiroides, ganglios linfáticos y más."
  },
  {
    nombre: "Ultrasonido Pared Abdominal",
    descripcion: "Examina las capas de la pared abdominal en busca de hernias y otras afecciones."
  },
  {
    nombre: "Ultrasonido Tejidos Blandos",
    descripcion: "Imágenes de alta resolución para evaluar músculos, tendones y tejidos blandos."
  },
  {
    nombre: "Ultrasonido Inguinal",
    descripcion: "Utilizado para examinar la ingle en busca de hernias u otras afecciones. *Estudio en Consultorio."
  },
  {
    nombre: "Ultrasonido Mamario",
    descripcion: "Proporciona imágenes detalladas de los senos para la detección temprana de anomalías. *Estudio en Consultorio."
  },
  {
    nombre: "Ultrasonido Hombro",
    descripcion: "Evalúa lesiones y condiciones en el hombro, incluyendo tendones y articulaciones."
  },
  {
    nombre: "Ultrasonido Codo",
    descripcion: "Examen del codo para detectar lesiones o condiciones como la epicondilitis."
  },
  {
    nombre: "Ultrasonido Tendón Aquiles",
    descripcion: "Evalúa el tendón de Aquiles en busca de lesiones o inflamación."
  },
  {
    nombre: "Ultrasonido Cadera (Displasia)",
    descripcion: "Utilizado para el diagnóstico temprano de la displasia de cadera en bebés."
  },
  {
    nombre: "Ultrasonido Doppler Carotídeo",
    descripcion: "Evalúa el flujo sanguíneo en las arterias carótidas del cuello para detectar obstrucciones."
  },
  {
    nombre: "Ultrasonido Doppler Arterial MP o MT",
    descripcion: "Proporciona información sobre el flujo sanguíneo en arterias de miembros superiores o inferiores."
  },
  {
    nombre: "Ultrasonido Doppler Venoso MP o MT",
    descripcion: "Evalúa el flujo sanguíneo en venas de miembros superiores o inferiores."
  },
  {
    nombre: "Ultrasonido Doppler Renal",
    descripcion: "Proporciona información sobre el flujo sanguíneo en los riñones para evaluar su función."
  },
  {
    nombre: "Ultrasonido Doppler Testicular",
    descripcion: "Evaluamos tus testículos y su flujo sanguíneo para detectar problemas tempranos, como torsión testicular o varicocele."
  },
  {
    nombre: "Ultrasonido Doppler Hepático y vías biliares",
    descripcion: "Examinamos tu hígado y vías biliares para identificar obstrucciones y evaluar la salud hepática."
  }
];
const estudiosClinicos = [
  {
    nombre: "Estudio de Genómica Personalizada",
    descripcion: "Analiza tu perfil genético para identificar predisposiciones genéticas a enfermedades y personalizar estrategias de prevención y tratamiento."
  },
  {
    nombre: "Ensayo Clínico de Nuevos Fármacos",
    descripcion: "Participa en la evaluación de la eficacia y seguridad de nuevos medicamentos en desarrollo, contribuyendo al avance de la investigación médica."
  },
  {
    nombre: "Estudio de Biomarcadores en Pacientes Oncológicos",
    descripcion: "Investiga biomarcadores específicos en pacientes con cáncer para desarrollar terapias más dirigidas y eficaces contra diferentes tipos de tumores."
  },
  {
    nombre: "Estudio Epidemiológico de Enfermedades Infecciosas",
    descripcion: "Recopila datos para entender la propagación y características de enfermedades infecciosas, facilitando estrategias de prevención y control."
  },
  {
    nombre: "Estudio Longitudinal de Envejecimiento Saludable",
    descripcion: "Seguimiento a largo plazo de personas mayores para entender los factores que contribuyen a un envejecimiento saludable y prevenir enfermedades asociadas."
  },
  {
    nombre: "Investigación de Factores Ambientales y Salud",
    descripcion: "Analiza la relación entre factores ambientales (como la exposición a productos químicos) y la salud humana, buscando comprender y mitigar riesgos."
  },
  {
    nombre: "Estudio de Efectividad de Vacunas",
    descripcion: "Evalúa la efectividad y seguridad de vacunas en poblaciones específicas, contribuyendo a la mejora de programas de vacunación."
  },
  {
    nombre: "Estudio de Psicoterapias en Trastornos Mentales",
    descripcion: "Investigación sobre la eficacia de diferentes enfoques de psicoterapia en el tratamiento de trastornos mentales, buscando mejorar las opciones terapéuticas."
  },
  {
    nombre: "Estudio de Nutrición y Salud Cardiovascular",
    descripcion: "Analiza la relación entre patrones dietéticos y la salud cardiovascular, proporcionando información para estrategias de prevención de enfermedades cardíacas."
  }
];
const studyTypesSeed = [{
  name: "Estudios de Ultrasonido",
  estudios: estudiosUltrasonido
}, {
  name: "Estudios Cardiológicos",
  estudios: estudiosCardiologicos
},{
  name: "Estudios Clínicos",
  estudios: estudiosClinicos
}];


const generateRandomElement = (array) => faker.random.arrayElement(array);

const generatePatients = (count) => {
  const genderOptions = ["Hombre", "Mujer"];
  const statusPatientOptions = ["Activo", "Archivado"];

  return Array.from({ length: count }, () => ({
    name: faker.name.findName(),
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.phoneNumber("(##) #### #### #####"),
    information: faker.lorem.sentence(),
    dateOfBirth: faker.date.past(),
    gender: generateRandomElement(genderOptions),
    status: generateRandomElement(statusPatientOptions),
  }));
};

const createCategories = async () => {
  return Promise.all(studyTypesSeed.map(async (category) => {
    const createdCategory = await prisma.category.create({
      data: { name: category.name },
    });
    return { ...createdCategory, studyTypes: category.estudios };
  }));
};

const createPatients = async (patientsData) => {
  return Promise.all(patientsData.map(async (patientInfo) => {
    return prisma.patient.create({
      data: patientInfo,
    });
  }));
};

const createMedicalReports = async (medicalReportsData) => {
  return Promise.all(medicalReportsData.map(async (medicalReportInfo) => {
    return prisma.medicalReport.create({
      data: medicalReportInfo,
    });
  }));
};

const createStudies = async (studiesData) => {
  return Promise.all(studiesData.map(async (studyInfo) => {
    return prisma.study.create({
      data: studyInfo,
    });
  }));
};

const createStudyTypes = async (categories) => {
  return Promise.all(categories.map(async (category) => {
    return Promise.all(category.studyTypes.map(async (typeStudy) => {
      return prisma.studyType.create({
        data: {
          name: typeStudy.nombre,
          description: typeStudy.descripcion,
          category: { connect: { id: category.id } },
        },
      });
    }));
  }));
};

const generateStudies = (medicalReports, studyTypes) => {
  const numStudies = faker.datatype.number({ min: 1, max: 30 });
  
  return Array.from({ length: numStudies }, () => {
    const medicalReport = (generateRandomElement(medicalReports));
    return {
      type: {
        connect: { id: generateRandomElement(generateRandomElement(studyTypes)).id },
      },
      name: faker.lorem.words(2),
      createdAt: faker.date.past(),
      medicalReport: { connect: { id: medicalReport.id } },
    };
  });
};

const generateMedicalReports = (count, patients) => {
  return Array.from({ length: count }, () => {
    const patient = generateRandomElement(patients);

    return {
      name: faker.lorem.words(2),
      date: faker.date.past(),
      status: generateRandomElement(statusOptions),
      diagnosis: faker.lorem.sentence(),
      patientId: patient.id
    };
  });
};


const main = async () => {
  try {
    await prisma.study.deleteMany();
    await prisma.studyType.deleteMany();
    await prisma.category.deleteMany();
    await prisma.medicalReport.deleteMany();
    await prisma.patient.deleteMany();

    const categories = await createCategories();
    const studyTypes = await createStudyTypes(categories);
/*
    const patientsData = generatePatients(5);
    const patients = await createPatients(patientsData);

    const medicalReportsData = generateMedicalReports(8, patients);
    const medicalReports = await createMedicalReports(medicalReportsData);

    const studiesData = generateStudies(medicalReports, studyTypes);
    await createStudies(studiesData);
*/
    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
};

main();
