import { InjectionToken, OpaqueToken } from 'injection-js';
import { ExpressHandler } from './express-handler';

export const EXPRESS_HANDLERS = new InjectionToken<ExpressHandler>('EXPRESS_REQUEST_HANDLER');
