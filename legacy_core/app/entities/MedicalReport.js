const jwt = require('jsonwebtoken');

class MedicalReport {
  constructor({ id, date, status, diagnosis, patient, studies, patientId }) {
    this.id = id;
    this.name = patient?.name;
    this.date = date;
    this.status = status;
    this.diagnosis = diagnosis;
    this.patient = patient;
    this.studies = studies;
    this.patientId = patientId;
  }

  generateToken() {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 15); // Add 15 days to the current date

    const token = jwt.sign({ medicalReportId: this.id }, 'tu_secreto_secreto', {
      expiresIn: '15d',
    });

    this.expirationDate = expirationDate.toISOString(); // Assign the expiration date as a string

    // Agregar el token a la URL de la aplicación
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/token/${token}`;

    return url;
  }
}

module.exports = MedicalReport;
