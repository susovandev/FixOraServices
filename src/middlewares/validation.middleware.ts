import type { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { ValidationError, Schema } from 'joi';

export type TRequestType = 'body' | 'query' | 'params';

export const formatJoiError = (error: ValidationError) => {
  return error.details.map(d => ({
    field: d.path.join('.'),
    message: d.message.replace(/['"]/g, ''),
  }));
};

const validateRequest =
  (schema: Schema, property: TRequestType = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    const isApiRequest = req.originalUrl.startsWith('/api');
    if (error) {
      const formattedErrors = formatJoiError(error);

      if (isApiRequest) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Validation error',
          errors: formattedErrors,
        });
      }

      if (req.flash) {
        req.flash('error', formattedErrors[0]?.message as string);
        return res.redirect('/');
      }
    }
    req[property] = value;
    next();
  };

export default validateRequest;
