import { Injectable } from 'injection-js';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import { URL } from 'url';

import { DatabaseService } from './database.service';
import { Database } from './database';
import { SampleEntity } from '../model';

declare var emit: any;

@Injectable()
export class SampleEntityService {
  private _sampleEntityDatabase: Database<SampleEntity>;

  public constructor(
    private databaseService: DatabaseService
  ) {
    this._sampleEntityDatabase = databaseService.openDatabase<SampleEntity>(
      'sample-entity',
      (sampleEntity) => {
        sampleEntity.lastSeen = new Date(sampleEntity.lastSeen);
        return sampleEntity;
      },
      undefined,
      (localItem, databaseItem) => {
        localItem._rev = databaseItem._rev;
        if (localItem.lastSeen.getTime() < databaseItem.lastSeen.getTime()) {
          localItem.lastSeen = databaseItem.lastSeen;
        }

        if (localItem.updatedAt.getTime() < databaseItem.updatedAt.getTime()) {
          localItem.updatedAt = databaseItem.updatedAt;
        }

        return localItem;
      }
    );
  }

  public getSampleEntities(): Observable<SampleEntity[]> {
    return this._sampleEntityDatabase.getEntities();
  }
  
  public getOrCreateSampleEntity(sampleEntity: SampleEntity): Observable<SampleEntity> {
    return this.getSampleEntityById(sampleEntity.name).catch((error) => {
      if (error.status !== 404) {
        throw error;
      }

      return <Observable<SampleEntity>>this._sampleEntityDatabase.postEntity(sampleEntity, sampleEntity.name).catch((error) => {
        console.log('error while posting sample entity', sampleEntity, error);
        throw error;
      });
    });
  }

  public getSampleEntityById(id: string) {
    return this._sampleEntityDatabase.getEntityById(id);
  }

  public postSampleEntity(sampleEntity: SampleEntity): Observable<SampleEntity> {
    return this._sampleEntityDatabase.postEntity(sampleEntity);
  }

  public putSampleEntity(sampleEntity: SampleEntity): Observable<SampleEntity> {
    return this._sampleEntityDatabase.putEntity(sampleEntity);
  }

  public deleteSampleEntity(sampleEntity: SampleEntity): Observable<boolean> {
    return this._sampleEntityDatabase.removeEntity(sampleEntity);
  }

  public getSampleEntitiesLike(sampleEntity: SampleEntity): Observable<SampleEntity[]> {
    return this._sampleEntityDatabase.queryEntities('sample-entities-like', 'by_name', sampleEntity.name, function (doc) {
      if (doc._id.substr(0, 'sample-entity_'.length) === 'sample-entity_') {
        emit(doc.name);
      }
    });
  }
}
