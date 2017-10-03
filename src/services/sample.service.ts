import { Injectable } from 'injection-js';
import { URL } from 'url';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/switchMap';

import * as express from 'express';

import { GLOBAL_CONFIGURATION } from '../global.configuration';
import { ExpressGet, ExpressHandler, SampleEntityService, MessagingService } from '../shared';
import { SampleEntity } from '../shared/model';

@Injectable()
export class SampleService implements ExpressHandler {
  public constructor(
    private messagingService: MessagingService,
    private sampleEntityService: SampleEntityService
  ) {
  }

  @ExpressGet('/get-all')
  public getAllSampleEntities(request: express.Request, response: express.Response) {
    this.sampleEntityService.getSampleEntities().subscribe((sampleEntities) => {
      response.json(sampleEntities);
    }, (error) => {
      response.json({
        success: false,
        error
      })
    });
  }

  @ExpressGet('/create/:name')
  public createSampleEntity(request: express.Request, response: express.Response) {
    this.createSampleEntity1(request.params.name)
      .subscribe((sampleEntity) => {
        response.json(sampleEntity);
      }, (error) => {
        response.json({
          success: false,
          error
        });
      });
  }
  
  private createSampleEntity1(name: string): Observable<SampleEntity> {
    return this.sampleEntityService.getOrCreateSampleEntity({
      name: name,
      lastSeen: new Date()
    }).switchMap((sampleEntity) => {
      this.messagingService.publishMessage(sampleEntity).subscribe((response) => {
        console.log('Messaging Service replied: ', { content: response.content, id: response.original.properties.correlationId });
      });

      sampleEntity.lastSeen = new Date();
      return this.sampleEntityService.putSampleEntity(sampleEntity);
    });
  }

  public shutdown(): Observable<any> {
    return this.messagingService.shutdown().map(() => {
      console.info('Messaging service shut down.');
    });
  }
}
