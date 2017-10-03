import { Injectable } from 'injection-js';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/observable/forkJoin';

import * as uuidv4 from 'uuid/v4';
import * as Promise from 'bluebird';
import * as amq from 'amqp-ts';
import * as events from 'events';
import { AmqpService } from '../amqp';

@Injectable()
export class MessagingService {
  private _requestsQueue = 'ts-node-couch-di-starter-q';
  private _replyQueue = 'ts-node-couch-di-starter-reply-to';
  private _replyQueueConsumer;
  private _replyQueueEmitter: events.EventEmitter;

  public constructor(
    private amqpService: AmqpService
  ) {
  }

  public publishMessage(message: any): Observable<any> {
    // Inspired by https://github.com/squaremo/amqp.node/issues/259
    // and https://github.com/abreits/amqp-ts/issues/19
    return Observable.create((observer) => {
      Observable.forkJoin(
        this.amqpService.requestQueue(this._requestsQueue),
        this.amqpService.requestQueue(this._replyQueue),
        this.amqpService.completeConfiguration()
      ).subscribe((result) => {
        const [ queue, replyQueue ] = result;

        if (!this._replyQueueConsumer) {
          this._replyQueueEmitter = new events.EventEmitter();
          this._replyQueueEmitter.setMaxListeners(0);
          this._replyQueueConsumer = replyQueue.activateConsumer((response) => {
            const content = response.getContent();
            this._replyQueueEmitter.emit(response.properties.correlationId, response);
          }, { noAck: true });
        }

        const correlationId = uuidv4();
        const replyTo = replyQueue.name;

        this._replyQueueEmitter.once(correlationId, (replyMessage) => {
          observer.next({
            original: replyMessage,
            get content() {
              return replyMessage.getContent();
            }
          });
        });

        const amqMessage = new amq.Message(message, {
          correlationId,
          replyTo,
          persistent: true
        });
        queue.send(amqMessage);
      }, (error) => {
        observer.error(error);
      });
    });
  }

  public consumeMessages(): Observable<any> {
    const handler = new Subject<any>();
    Observable.forkJoin(
      this.amqpService.requestQueue(this._requestsQueue),
      this.amqpService.completeConfiguration()
    ).subscribe((result) => {
      const [ queue ] = result;
      queue.prefetch(1);
      queue.activateConsumer((message) => {
        const content = message.getContent();
        
        return new Promise((resolve, reject) => {
          const responder = new Subject<any>();
          responder.subscribe((response) => {
            this.amqpService.requestQueue(message.properties.replyTo).subscribe((replyQueue) => {
              message.ack();

              const amqMessage = new amq.Message(response, {
                correlationId: message.properties.correlationId
              });
              amqMessage.sendTo(replyQueue);
              resolve(amqMessage);
            }, (error) => {
              reject(error);
            });
          }, (error) => {
            reject(error);
          });
          
          handler.next({
            original: message,
            get content() {
              return message.getContent();
            },

            responder,
            reply(response) {
              responder.next(response);
            },
            fail(response) {
              responder.error(response);
            }
          });
        });
      }, { noAck: false });
    });

    return handler;
  }

  public shutdown(): Observable<void> {
    return this.amqpService.closeConnection();
  }
}
