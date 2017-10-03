import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';

import { Entity } from '../model';

export class Database<T extends Entity> {
  public entityPosted = new Subject<T>();
  public entityPut = new Subject<T>();
  public entityRemoved = new Subject<T>();

  public constructor(
    private _database: any,
    private _name: string,
    private _deserialize: (item: T) => T,
    private _serialize: (item: T) => T,
    private _reconcile: (localItem: T, databaseItem: T) => T
  ) {
  }

  public getDatabase() {
    return this._database;
  }

  public buildId(id: string) {
    return `${this._name}_${id}`;
  }

  public getEntities(options?: any): Observable<T[]> {
    const defaultEndkey = options && options.descending ? '' : '\uffff';
    const defaultStartkey = options && options.descending ? '\uffff' : '';
    return <Observable<T[]>>Observable.fromPromise(this._database.allDocs({
      include_docs: true,
      startkey: options && options.keys ? undefined : this.buildId(options && options.startkey ? options.startkey : defaultStartkey),
      endkey: options && options.keys ? undefined : this.buildId(options && options.endkey ? options.endkey : defaultEndkey),
      descending: options && options.descending,
      limit: options && options.limit,
      keys: options && options.keys
    })).map((documents: any) => {
      return documents.rows
        .filter((row) => !row.value || !row.value.deleted)
        .filter((row) => !!row.doc)
        .map((row) => row.doc)
        .map((item) => {
          try {
            return this.deserializeEntity(item);
          } catch (error) {
            return null;
          }
        });
    }).catch((error) => {
      console.error('Error while getting entities of type ', this._name, 'using options ', options, ': ', error);
      throw error;
    });
  }
  
  public getEntityById(id: string): Observable<T> {
    return this.getEntityById1(this.buildId(id));
  }

  private getEntityById1(id: string): Observable<T> {
    let observable: Observable<T> = Observable.fromPromise(this._database.get(id)).map((item: T) => {
      return this.deserializeEntity(item);
    });
    
    return <Observable<T>>observable.catch((error) => {
      console.error('Error while getting entity of type ', this._name, ' with id ', id, ': ', error);
      throw error;
    });
  }

  public postEntity(item: T, id?: string): Observable<T> {
    const now = new Date();
    const transient = item.transient;
    item._id = this.buildId(id || now.toJSON());
    item.transient = undefined;
    item.updatedAt = item.createdAt = now;

    return Observable.fromPromise(this._database.put(this.serializeEntity(item))).map((result: any) => {
      if (result.ok) {
        item._rev = result.rev;
        item.transient = transient;
        this.entityPosted.next(item);
        return item;
      } else {
        throw new Error(`Error while posting entity: ${JSON.stringify(item)}`);
      }
    }).catch((error) => {
      if (error.status === 409) {
        return this.handleConflict(item, error).switchMap((reconciledItem) => {
          return this.postEntity(reconciledItem, id);
        });
      }

      console.log('Error while posting entity ', item, ' with id? ', id, ': ', error);
      throw error;
    });
  }

  public putEntity(item: T): Observable<T> {
    const now = new Date();
    const transient = item.transient;
    item.transient = undefined;
    item.updatedAt = now;
    item.createdAt = item.createdAt || item.updatedAt;

    return Observable.fromPromise(this._database.put(this.serializeEntity(item))).map((result: any) => {
      if (result.ok) {
        item._rev = result.rev;
        item.transient = transient;
        this.entityPut.next(item);
        return item;
      } else {
        throw new Error(`Error while putting entity ${item._id}: ${JSON.stringify(item)}`);
      }
    }).catch((error) => {
      if (error.status === 409) {
        return this.handleConflict(item, error).switchMap((reconciledItem) => {
          return this.putEntity(reconciledItem);
        });
      }

      console.log('Error while putting entity ', item, ': ', error);
      throw error;
    });
  }

  private handleConflict(localItem: T, error: any): Observable<T> {
    if (!localItem._id) {
      // can't handle a brand new document
      throw error;
    }

    if (!this._reconcile) {
      throw error;
    }

    return this.getEntityById1(localItem._id).map((databaseItem) => {
      return this._reconcile(localItem, databaseItem);
    });
  }

  public removeEntity(item: T): Observable<boolean> {
    return Observable.fromPromise(this._database.remove(item)).map((result: any) => {
      this.entityRemoved.next(item);
      return result.ok;
    }).catch((error) => {
      this.entityRemoved.error(error);
      throw error;
    });
  }

  private deserializeEntity(item: T): T {
    item.createdAt = new Date(item.createdAt);
    item.updatedAt = new Date(item.updatedAt);
    return this._deserialize ? this._deserialize(item) : item;
  }

  private serializeEntity(item: T): T {
    return this._serialize ? this._serialize(item) : item;
  }
  
  public queryEntities(queryId: string, viewId, key, map: (item: T) => void): Observable<any> {
    return this.getQuery(queryId, viewId, map).switchMap((result: any) => {
      return this.runQuery(queryId, viewId, {
        key,
        include_docs: true
      });
    });
  }

  public getQuery(queryId: string, viewId: string, map: (item: T) => void): Observable<any> {
    const id = `_design/${queryId}`;
    return Observable.fromPromise(this._database.get(id))
      .catch((error) => {
        if (error.status === 404) {
          return Observable.fromPromise(this._database.put({
            _id: id,
            views: {
              [viewId]: {
                map: map.toString()
              }
            }
          }));
        }

        throw error;
      });
  }

  public runQuery(queryId: string, viewId: string, options: any): Observable<T[]> {
    return Observable.fromPromise(this._database.query(queryId + '/' + viewId, options)).map((result: any) => {
      return result.rows.map((row) => row.doc).map((item) => this.deserializeEntity(item));
    });
  }
}
