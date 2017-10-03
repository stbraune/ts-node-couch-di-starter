import { Injectable } from 'injection-js';
import { Observable } from 'rxjs/Observable';

import { ExpressService, ExpressGet } from './shared';
import { SampleService } from './services';

import * as express from 'express';

@Injectable()
export class AppService {
  public constructor(
    private expressService: ExpressService,
    private sampleService: SampleService
  ) {
  }

  public bindRoutesAndListen(): AppService {
    return this.bindRoutes().listen();
  }

  public bindRoutes(): AppService {
    this.expressService.autoBindRoutes();
    return this;
  }

  public listen(): AppService {
    this.expressService.listenExpressApplication();
    return this;
  }

  public shutdown(): Observable<any> {
    return this.sampleService.shutdown();
  }
}
