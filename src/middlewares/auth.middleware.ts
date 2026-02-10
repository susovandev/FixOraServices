/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response, NextFunction } from 'express';

import authHelper from 'modules/auth/auth.helper.js';
import refreshTokenModel from 'models/refresh-token.model.js';
import userModel, { type IUserDocument } from 'models/user.model.js';
import { ACCESS_TOKEN_EXPIRATION_TIME } from 'constants/index.js';
import envConfig from 'config/env.config.js';
import Logger from 'config/logger.config.js';
export function redirectPage(req: Request, res: Response) {
  const segment = req.originalUrl.split('/')[1];

  if (['users', 'admin', 'technicians'].includes(segment as string)) {
    return res.redirect(`/${segment}/login`);
  }

  return res.redirect('/users/auth/login');
}
export const AuthGuardEJS = async (req: Request, res: Response, next: NextFunction) => {
  Logger.info(`Auth request from ip: ${req.ip}`);

  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    Logger.error('No refresh token found');
    req.flash('error', 'Please login first');
    return redirectPage(req, res);
  }

  // If accessToken is valid
  if (accessToken) {
    const decoded = authHelper.verifyAccessToken(accessToken);
    if (!decoded) {
      Logger.error('Access token verification failed');
      return redirectPage(req, res);
    }

    if (decoded) {
      const user = await userModel.findOne({
        _id: decoded?.sub,
      });
      if (!user) {
        Logger.error('User not found');
        return redirectPage(req, res);
      }

      req.user = user as IUserDocument;
      res.locals.currentUser = user;
      return next();
    }
  }

  // If refreshToken is valid
  const decoded = authHelper.verifyRefreshToken(refreshToken);
  if (!decoded) {
    Logger.error('Refresh token verification failed');
    return redirectPage(req, res);
  }

  // Check if refresh token is valid
  const isValidRefreshToken = await refreshTokenModel.findOne({
    userId: decoded.sub,
    tokenHash: refreshToken,
  });

  if (!isValidRefreshToken) {
    Logger.error('Invalid refresh token');
    return redirectPage(req, res);
  }

  const user = await userModel.findById(isValidRefreshToken.userId);
  if (!user) {
    Logger.error('User not found');
    return redirectPage(req, res);
  }

  const newAccessToken = authHelper.signAccessToken(user);
  if (!newAccessToken) {
    Logger.error('Access token signing failed');
    return redirectPage(req, res);
  }

  Logger.info('New Access token signed successfully...');

  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: envConfig.NODE_ENV === 'production',
    maxAge: ACCESS_TOKEN_EXPIRATION_TIME,
  });

  req.user = user as IUserDocument;
  res.locals.currentUser = user;
  next();
};

export const OptionalAuthEJS = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies?.accessToken;

  if (accessToken) {
    try {
      const decoded = authHelper.verifyAccessToken(accessToken);
      if (decoded) {
        const user = await userModel.findOne({ _id: decoded.sub, isDeleted: false });
        if (user) {
          req.user = user;
          res.locals.currentUser = user;
        }
      }
    } catch (err: any) {
      Logger.error(err.message);
      res.locals.currentUser = null;
    }
  }

  next();
};
