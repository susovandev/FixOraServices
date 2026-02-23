/* eslint-disable @typescript-eslint/no-explicit-any */
import 'express';

declare module 'express' {
  interface Request {
    flash(type: string, message?: string | string[]): string[];
    user?: any;
  }
}
