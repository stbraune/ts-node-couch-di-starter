import { ExpressConfiguration } from './express';
import { AmqpConfiguration } from './amqp';

export interface Configuration {
  express: ExpressConfiguration;
  amqp: AmqpConfiguration;
  database: {
    url: string
  };
};
