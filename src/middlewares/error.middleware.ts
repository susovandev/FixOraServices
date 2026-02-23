/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Request, Response, NextFunction } from 'express';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  const isApiRequest = req.originalUrl.startsWith('/api');

  console.error('ERROR', {
    errorId: err.errorId,
    message: err.message,
    stack: err.stack,
  });

  if (isApiRequest) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  return res.status(statusCode).render('errors/500', {
    statusCode,
    title: 'Unexpected Error Our team is working on it. Thank you for your patience',
    message,
    errorId: err.errorId,
  });
};
