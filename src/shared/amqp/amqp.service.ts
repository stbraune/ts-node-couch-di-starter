import { Injectable, Inject } from 'injection-js';
import * as Promise from 'bluebird';
import * as amq from 'amqp-ts';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';

import { AmqpConfiguration } from './amqp-configuration';
import { AMQP_CONFIGURATION } from './amqp-configuration-token';

@Injectable()
export class AmqpService {
  private _amqConnection: amq.Connection;

  public constructor(
    @Inject(AMQP_CONFIGURATION) private amqpConfiguration: AmqpConfiguration
  ) {
  }

  public requestConnection(): Observable<amq.Connection> {
    if (this._amqConnection) {
      return Observable.of(this._amqConnection);
    }

    this._amqConnection = new amq.Connection(this.amqpConfiguration.host);
    return new Observable<amq.Connection>((observer) => {
      this._amqConnection.declareTopology(this.amqpConfiguration.topology).then(() => {
        observer.next(this._amqConnection);
        observer.complete();
      }).catch((error) => {
        observer.error(error);
      });
    });
  }

  public requestExchange(
    name: string,
    type?: string,
    options?: amq.Exchange.DeclarationOptions
  ): Observable<amq.Exchange> {
    return this.requestConnection().map((amqConnection: amq.Connection) => {
      return amqConnection.declareExchange(name, type, options);
    });
  }

  public requestQueue(
    name: string,
    options?: amq.Queue.DeclarationOptions
  ): Observable<amq.Queue> {
    return this.requestConnection().map((amqConnection: amq.Connection) => {
      return amqConnection.declareQueue(name, options);
    });
  }

  public completeConfiguration(): Observable<amq.Connection> {
    return Observable.create((observer) => {
      this.requestConnection().subscribe((amqConnection) => {
        amqConnection.completeConfiguration().then(() => {
          observer.next(amqConnection);
          observer.complete(amqConnection);
        }).catch((error) => {
          observer.error(error);
        });
      }, (error) => {
        observer.error(error);
      });
    });
  }

  public closeConnection(
    amqpConnection?: amq.Connection,
    timeout: number = 15000
  ): Observable<void> {
    if (!amqpConnection && this._amqConnection) {
      return this.closeConnection(this._amqConnection, timeout);
    }

    return new Observable<void>((observer) => {
      setTimeout(() => {
        amqpConnection.close();
        observer.next();
        observer.complete()
      }, timeout);
    });
  }
}
