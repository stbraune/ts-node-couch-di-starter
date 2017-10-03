import 'reflect-metadata';
import * as express from 'express';
import { PathParams } from './path-params';
import { ExpressMetadata } from './express-metadata';

export function ExpressRequestHandlerDecoratorFactory(path: PathParams, symbol: symbol) {
  return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<express.RequestHandler>) {
    Reflect.defineMetadata(symbol, <ExpressMetadata>{
      symbol: symbol,
      path: path
    }, target, propertyKey);
  };
}
