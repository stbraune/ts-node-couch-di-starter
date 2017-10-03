import { InjectionToken, OpaqueToken } from 'injection-js';
import { ExpressConfiguration } from './express-configuration';

export const EXPRESS_CONFIGURATION = new InjectionToken<ExpressConfiguration>('EXPRESS_CONFIGURATION');
