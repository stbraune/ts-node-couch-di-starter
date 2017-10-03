import { Injectable } from 'injection-js';
import { Database } from './database';
import { Entity } from '../model';

const PouchDB = require('pouchdb');

import { GLOBAL_CONFIGURATION } from '../../global.configuration';

@Injectable()
export class DatabaseService {
  public constructor() {
  }

  public openDatabase<T extends Entity>(
    name: string,
    deserialize?: (item: T) => T,
    serialize?: (item: T) => T,
    reconcile?: (localItem: T, databaseItem: T) => T
  ): Database<T> {
    return new Database<T>(new PouchDB(GLOBAL_CONFIGURATION.database.url), name, deserialize, serialize, reconcile);
  }
}
