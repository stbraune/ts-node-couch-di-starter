import { Provider } from 'injection-js';
import { EXPRESS_CONFIGURATION } from './shared';
import { AMQP_CONFIGURATION } from './shared';
import { SHARED_PROVIDERS } from './shared';

import { GLOBAL_CONFIGURATION } from './global.configuration';

export const GLOBAL_PROVIDERS: Provider[] = [
  {
    provide: EXPRESS_CONFIGURATION,
    useValue: GLOBAL_CONFIGURATION.express
  },
  {
    provide: AMQP_CONFIGURATION,
    useValue: GLOBAL_CONFIGURATION.amqp
  },
  ...SHARED_PROVIDERS
];
