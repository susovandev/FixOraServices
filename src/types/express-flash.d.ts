/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import 'express-session';
import type { Types } from 'mongoose';

declare module 'express-session' {
  interface SessionData {
    flash?: { [key: string]: string };
    technicianDetails?: {
      _id: Types.ObjectId;
      phone: string;
    };
  }
}
