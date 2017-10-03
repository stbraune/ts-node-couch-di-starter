import { Configuration } from './shared';
import { GLOBAL_CONFIGURATION as GLOBAL_CONFIGURATION_DEV } from './global.configuration.dev';
import { GLOBAL_CONFIGURATION as GLOBAL_CONFIGURATION_PROD } from './global.configuration.prod';

let GLOBAL_CONFIGURATION: Configuration = {
  express: undefined,
  amqp: undefined,
  database: {
    url: undefined
  }
};

console.info('Using environment:', process.env.NODE_ENV || 'dev (default)');
if (process.env.NODE_ENV === 'prod') {
  GLOBAL_CONFIGURATION = GLOBAL_CONFIGURATION_PROD;
} else {
  GLOBAL_CONFIGURATION = GLOBAL_CONFIGURATION_DEV;
}
console.info('Effective configuration:', JSON.stringify(GLOBAL_CONFIGURATION, undefined, 2));

export { GLOBAL_CONFIGURATION };
