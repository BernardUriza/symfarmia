class Patient {
  constructor({ id, name, email, phone, information, dateOfBirth, gender, status }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.information = information;
    this.dateOfBirth = dateOfBirth;
    this.gender = gender;
    this.status = status;
  }
}

module.exports = Patient;
