export class Patient {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    public phone: string,
    public information: string,
    public dateOfBirth: Date,
    public gender: string,
    public status: string
  ) {}
}
