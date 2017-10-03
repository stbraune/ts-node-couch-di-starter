import 'reflect-metadata';
import { ReflectiveInjector } from 'injection-js';
import { APP_PROVIDERS } from './app.providers';
import { AppService } from './app.service';

try {
  console.info(process.pid, 'Starting App...');
  console.info(process.pid, 'Node Versions: ', process.versions);
  if (process.versions.node < '8.1.4') {
    throw new Error('App requires Node 8.1.4 or higher to run.');
  }

  const injector = ReflectiveInjector.resolveAndCreate(APP_PROVIDERS);
  const appService: AppService = injector.get(AppService);

  process.on('SIGINT', () => {
    appService.shutdown().subscribe(() => {
      console.info('Exited gracefully.');
      process.exit();
    }, (error) => {
      console.warn('Error occurred while shutting down:', error);
    });
  });

  appService.bindRoutesAndListen();
} catch (error) {
  console.error(process.pid, 'An unexpected error occurred:', error);
}
