import { ExpressConfiguration } from './shared';
import { AmqpConfiguration } from './shared';
import { Configuration } from './shared';

const EXPRESS_CONFIGURATION: ExpressConfiguration = {
  port: 3005
};

const AMQP_CONFIGURATION: AmqpConfiguration = {
  host: 'amqp://localhost',
  topology: {
    queues: [
      {
        name: 'ts-node-couch-di-starter-q',
        options: {
          durable: true
        }
      },
      {
        name: 'ts-node-couch-di-starter-reply-to',
        options: {
          durable: false
        }
      }
    ]
  }
};

export const GLOBAL_CONFIGURATION: Configuration = {
  express: EXPRESS_CONFIGURATION,
  amqp: AMQP_CONFIGURATION,

  database: {
    url: 'http://localhost:5984/sample-entities'
  }
};
