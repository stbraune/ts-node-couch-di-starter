import * as express from 'express';
export type RequestHandlerParams = express.RequestHandler | express.ErrorRequestHandler | (express.RequestHandler | express.ErrorRequestHandler)[];
