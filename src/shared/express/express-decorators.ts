import 'reflect-metadata';
import * as express from 'express';
import { PathParams } from './path-params';
import { ExpressMetadata } from './express-metadata';

import { ExpressSymbols } from './express-symbols';

import { ExpressRequestHandlerDecoratorFactory } from './express-request-handler-decorator-factory';

export function ExpressAll(path: PathParams) {
  return ExpressRequestHandlerDecoratorFactory(path, ExpressSymbols.All);
}

export function ExpressGet(path: PathParams) {
  return ExpressRequestHandlerDecoratorFactory(path, ExpressSymbols.Get);
};

export function ExpressPost(path: PathParams) {
  return ExpressRequestHandlerDecoratorFactory(path, ExpressSymbols.Post);
};

export function ExpressPut(path: PathParams) {
  return ExpressRequestHandlerDecoratorFactory(path, ExpressSymbols.Put);
};

export function ExpressDelete(path: PathParams) {
  return ExpressRequestHandlerDecoratorFactory(path, ExpressSymbols.Delete);
};

export function ExpressPatch(path: PathParams) {
  return ExpressRequestHandlerDecoratorFactory(path, ExpressSymbols.Patch);
};

export function ExpressOptions(path: PathParams) {
  return ExpressRequestHandlerDecoratorFactory(path, ExpressSymbols.Options);
};

export function ExpressHead(path: PathParams) {
  return ExpressRequestHandlerDecoratorFactory(path, ExpressSymbols.Head);
};

export function ExpressUse(path?: PathParams) {
  return ExpressRequestHandlerDecoratorFactory(path, ExpressSymbols.Use);
};
