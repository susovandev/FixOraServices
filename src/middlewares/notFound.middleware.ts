import type { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction) => {
  const isApiRequest =
    req.originalUrl.startsWith('/api') ||
    req.headers.accept?.includes('application/json') ||
    req.xhr;

  if (isApiRequest) {
    return res.status(404).json({
      success: false,
      message: 'Route not found',
      path: req.originalUrl,
    });
  }

  return res.render('errors/404', {
    title: '404 | Page Not Found',
    path: req.originalUrl,
  });
};
