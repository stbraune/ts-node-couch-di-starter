import { InjectionToken, OpaqueToken } from 'injection-js';
import { AmqpConfiguration } from './amqp-configuration';

export const AMQP_CONFIGURATION = new InjectionToken<AmqpConfiguration>('AMQP_CONFIGURATION');
