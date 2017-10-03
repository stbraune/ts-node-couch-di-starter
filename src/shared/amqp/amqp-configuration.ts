import { Connection } from 'amqp-ts';

export interface AmqpConfiguration {
  host: string;
  topology: Connection.Topology
};
