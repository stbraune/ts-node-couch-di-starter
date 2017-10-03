export interface Entity {
  _id?: string;
  _rev?: string;

  transient?: any;

  createdAt?: Date;
  updatedAt?: Date;
}
