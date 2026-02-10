import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from 'models/user.model.js';

export const RoleGuardEJS =
  (...allowedRoles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req?.user;
      if (!user || !allowedRoles.includes(user.role as UserRole)) {
        req.flash('error', 'Access denied');
        return res.redirect('/');
      }
      next();
    } catch (error) {
      next(error);
    }
  };
