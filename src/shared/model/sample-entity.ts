import { Entity } from './entity';

export interface SampleEntity extends Entity {
  name: string;
  lastSeen: Date;
}
