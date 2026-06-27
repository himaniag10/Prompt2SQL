import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import env from '../config/env';
import { AppError } from '../shared/errors/AppError';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack || err.message);

  let statusCode = 500;
  let message = 'Internal Server Error';

  if ('statusCode' in err) {
    statusCode = err.statusCode;
    message = err.message;
  }

  res.status(statusCode).json({
    status: 'error',
    message: message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
