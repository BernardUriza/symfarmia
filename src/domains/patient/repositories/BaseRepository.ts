export interface BaseRepository<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  /** Retrieve all entities */
  findAll(): Promise<T[]>;
  /** Find a single entity by id */
  findById(id: number): Promise<T | null>;
  /** Create a new entity */
  create(data: CreateDTO): Promise<T>;
  /** Update an existing entity */
  update(id: number, data: UpdateDTO): Promise<T>;
  /** Delete an entity by id */
  delete(id: number): Promise<void>;
}
