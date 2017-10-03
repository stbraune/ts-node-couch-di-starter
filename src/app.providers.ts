import { Provider } from 'injection-js';
import { GLOBAL_PROVIDERS } from './global.providers';

import { AppService } from './app.service';
import { SampleService } from './services';
import { EXPRESS_HANDLERS } from './shared';

export const APP_PROVIDERS: Provider[] = [
  ...GLOBAL_PROVIDERS,
  
  {
    provide: AppService,
    useClass: AppService
  },
  {
    provide: SampleService,
    useClass: SampleService
  },

  {
    provide: EXPRESS_HANDLERS,
    useExisting: SampleService,
    multi: true
  }
];
