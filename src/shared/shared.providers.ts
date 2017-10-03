import { Provider } from 'injection-js';
import { ExpressService } from './express';
import { AmqpService } from './amqp';
import { MessagingService } from './messaging';
import {
  DatabaseService,
  SampleEntityService
} from './database';

export const SHARED_PROVIDERS: Provider[] = [
  {
    provide: ExpressService,
    useClass: ExpressService
  },
  {
    provide: AmqpService,
    useClass: AmqpService
  },
  {
    provide: MessagingService,
    useClass: MessagingService
  },
  {
    provide: DatabaseService,
    useClass: DatabaseService
  },
  {
    provide: SampleEntityService,
    useClass: SampleEntityService
  }
];
