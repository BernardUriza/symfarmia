export class BaseRepository<Model> {
  protected model: Model;

  constructor(model: Model) {
    this.model = model;
  }
}
