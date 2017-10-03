import { Injectable, Inject } from 'injection-js';
import * as express from 'express';
import 'reflect-metadata';

import { EXPRESS_CONFIGURATION } from './express-configuration-token';
import { ExpressConfiguration } from './express-configuration';

import { EXPRESS_HANDLERS } from './express-handlers-token';
import { ExpressHandler } from './express-handler';

import { ExpressSymbols } from './express-symbols';
import { ExpressMetadata } from './express-metadata';

@Injectable()
export class ExpressService {
  private _expressApplication: express.Application;

  private autoBindRouteBySymbol = {
    [ExpressSymbols.All]: (expressApplication: express.Application, expressMetadata: ExpressMetadata, expressRequestHandler: express.RequestHandler | express.ErrorRequestHandler) => {
      expressApplication.all(expressMetadata.path, expressRequestHandler);
    },
    [ExpressSymbols.Get]: (expressApplication: express.Application, expressMetadata: ExpressMetadata, expressRequestHandler: express.RequestHandler | express.ErrorRequestHandler) => {
      expressApplication.get(expressMetadata.path, expressRequestHandler);
    },
    [ExpressSymbols.Post]: (expressApplication: express.Application, expressMetadata: ExpressMetadata, expressRequestHandler: express.RequestHandler | express.ErrorRequestHandler) => {
      expressApplication.post(expressMetadata.path, expressRequestHandler);
    },
    [ExpressSymbols.Put]: (expressApplication: express.Application, expressMetadata: ExpressMetadata, expressRequestHandler: express.RequestHandler | express.ErrorRequestHandler) => {
      expressApplication.put(expressMetadata.path, expressRequestHandler);
    },
    [ExpressSymbols.Delete]: (expressApplication: express.Application, expressMetadata: ExpressMetadata, expressRequestHandler: express.RequestHandler | express.ErrorRequestHandler) => {
      expressApplication.delete(expressMetadata.path, expressRequestHandler);
    },
    [ExpressSymbols.Patch]: (expressApplication: express.Application, expressMetadata: ExpressMetadata, expressRequestHandler: express.RequestHandler | express.ErrorRequestHandler) => {
      expressApplication.patch(expressMetadata.path, expressRequestHandler);
    },
    [ExpressSymbols.Options]: (expressApplication: express.Application, expressMetadata: ExpressMetadata, expressRequestHandler: express.RequestHandler | express.ErrorRequestHandler) => {
      expressApplication.options(expressMetadata.path, expressRequestHandler);
    },
    [ExpressSymbols.Head]: (expressApplication: express.Application, expressMetadata: ExpressMetadata, expressRequestHandler: express.RequestHandler | express.ErrorRequestHandler) => {
      expressApplication.head(expressMetadata.path, expressRequestHandler);
    },
    [ExpressSymbols.Use]: (expressApplication: express.Application, expressMetadata: ExpressMetadata, expressRequestHandler: express.RequestHandler | express.ErrorRequestHandler) => {
      if (expressMetadata.path) {
        expressApplication.use(expressMetadata.path, expressRequestHandler);
      } else {
        expressApplication.use(expressRequestHandler);
      }
    },
  };

  public constructor(
    @Inject(EXPRESS_CONFIGURATION) private expressConfiguration: ExpressConfiguration,
    @Inject(EXPRESS_HANDLERS) private expressHandlers: ExpressHandler[]
  ) {
  }

  public getExpressApplication(): express.Application {
    if (!this._expressApplication) {
      this._expressApplication = express();
      console.info(process.pid, new Date(), 'Server started');
    }

    return this._expressApplication;
  }

  public autoBindRoutes(): express.Application {
    const expressApplication = this.getExpressApplication();

    this.expressHandlers.forEach((expressHandler) => {
      this.autoBindRoutesOfHandler(expressApplication, expressHandler);
    });

    return expressApplication;
  }

  private autoBindRoutesOfHandler(expressApplication: express.Application, expressHandler: ExpressHandler) {
    for (const propertyName in expressHandler) {
      this.autoBindRoutesOfProperty(expressApplication, expressHandler, propertyName);
    }
  }

  private autoBindRoutesOfProperty(expressApplication: express.Application, expressHandler: ExpressHandler, propertyName: string) {
    for (const metadataKey of Reflect.getMetadataKeys(expressHandler, propertyName)) {
      this.autoBindRouteOfProperty(expressApplication, expressHandler, propertyName, metadataKey);
    }
  }

  private autoBindRouteOfProperty(expressApplication: express.Application, expressHandler: ExpressHandler, propertyName: string, metadataKey: any) {
    if (this.autoBindRouteBySymbol[metadataKey]) {
      const expressMetadata: ExpressMetadata = Reflect.getMetadata(metadataKey, expressHandler, propertyName);
      try {
        if (typeof expressHandler[propertyName] !== 'function') {
          throw new Error('Cannot bind route to a non-function');
        }

        const expressRequestHandler = <express.RequestHandler | express.ErrorRequestHandler>expressHandler[propertyName].bind(expressHandler);
        this.autoBindRouteBySymbol[metadataKey](expressApplication, expressMetadata, expressRequestHandler);
        console.info(process.pid, 'ExpressService: Bound route ', expressMetadata, ' to ', `${expressHandler.constructor.name}.${propertyName}`);
      } catch (error) {
        console.error(process.pid, 'ExpressService: Failed binding route ', expressMetadata, ' to ', `${expressHandler.constructor.name}.${propertyName}`, error);
      }
    }
  }

  public listenExpressApplication(expressApplication?: express.Application): express.Application {
    if (!expressApplication) {
      return this.listenExpressApplication(this.getExpressApplication());
    }

    expressApplication.listen(this.expressConfiguration.port, () => {
      console.log(process.pid, 'Listening on port ', this.expressConfiguration.port);
    });
    return expressApplication;
  }
}
