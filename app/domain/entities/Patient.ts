export default class Patient {
  id?: number;
  name: string;
  email: string;
  phone: string;
  information: string;
  dateOfBirth: Date;
  gender: string;
  status: string;

  constructor({ id, name, email, phone, information, dateOfBirth, gender, status }: {
    id?: number;
    name: string;
    email: string;
    phone: string;
    information: string;
    dateOfBirth: Date;
    gender: string;
    status: string;
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.information = information;
    this.dateOfBirth = dateOfBirth;
    this.gender = gender;
    this.status = status;
  }

  validate(): boolean {
    return !!(
      this.name &&
      this.email &&
      this.phone &&
      this.dateOfBirth &&
      this.gender &&
      this.status
    );
  }

  updateStatus(status: string): void {
    this.status = status;
  }
}
