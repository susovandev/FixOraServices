/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response, NextFunction } from 'express';

import authHelper from 'modules/auth/auth.helper.js';
import refreshTokenModel from 'models/refresh-token.model.js';
import userModel from 'models/user.model.js';
import { ACCESS_TOKEN_EXPIRATION_TIME } from 'constants/index.js';
import envConfig from 'config/env.config.js';
import Logger from 'config/logger.config.js';
import techniciansModel from 'models/technicians.model.js';

export const AuthGuardEJS = async (req: Request, res: Response, next: NextFunction) => {
  Logger.info(`Auth request from ip: ${req.ip}`);

  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    Logger.error('No refresh token found');
    req.flash('error', 'Please login first');
    return res.redirect('/');
  }

  // If accessToken is valid
  if (accessToken) {
    const decoded = authHelper.verifyAccessToken(accessToken);
    if (!decoded) {
      Logger.error('Access token verification failed');
      return res.redirect('/');
    }

    if (decoded) {
      const user = await techniciansModel.findOne({
        _id: decoded?.sub,
      });
      if (!user) {
        Logger.error('User not found');
        return res.redirect('/');
      }

      req.user = user;
      res.locals.currentUser = user;
      return next();
    }
  }

  // If refreshToken is valid
  const decoded = authHelper.verifyRefreshToken(refreshToken);
  if (!decoded) {
    Logger.error('Refresh token verification failed');
    return res.redirect('/');
  }

  // Check if refresh token is valid
  const isValidRefreshToken = await refreshTokenModel.findOne({
    userId: decoded.sub,
    tokenHash: refreshToken,
  });

  if (!isValidRefreshToken) {
    Logger.error('Invalid refresh token');
    return res.redirect('/');
  }

  const user = await techniciansModel.findById(isValidRefreshToken.userId);
  if (!user) {
    Logger.error('User not found');
    return res.redirect('/');
  }

  const newAccessToken = authHelper.signAccessToken(user);
  if (!newAccessToken) {
    Logger.error('Access token signing failed');
    return res.redirect('/');
  }

  Logger.info('New Access token signed successfully...');

  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: envConfig.NODE_ENV === 'production',
    maxAge: ACCESS_TOKEN_EXPIRATION_TIME,
  });

  req.user = user;
  res.locals.currentUser = user;
  next();
};

export const OptionalAuthEJS = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies?.accessToken;

  if (accessToken) {
    try {
      const decoded = authHelper.verifyAccessToken(accessToken);
      if (decoded) {
        const user = await userModel.findOne({ _id: decoded.sub });
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

export const UserGuardEJS = async (req: Request, res: Response, next: NextFunction) => {
  const isApiRequest = req.path.startsWith('/api');
  Logger.info(`Auth request from ip: ${req.ip}, path: ${req.path}`);

  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;

  const handleError = (message: string, redirectPath = '/') => {
    Logger.error(message);
    if (isApiRequest) {
      req.flash('error', message);
      return res.status(401).json({ error: message });
    } else {
      req.flash('error', message);
      return res.redirect(redirectPath);
    }
  };

  if (!refreshToken) return handleError('Please login first');

  // If accessToken exists, verify it
  if (accessToken) {
    const decoded = authHelper.verifyAccessToken(accessToken);
    if (!decoded) return handleError('Access token verification failed');

    const user = await userModel.findById(decoded.sub);
    if (!user) return handleError('Please login first');

    req.user = user;
    res.locals.currentUser = user;
    return next();
  }

  // Access token missing or invalid, verify refresh token
  const decodedRefresh = authHelper.verifyRefreshToken(refreshToken);
  if (!decodedRefresh) return handleError('Refresh token verification failed');

  const validRefresh = await refreshTokenModel.findOne({
    userId: decodedRefresh.sub,
    tokenHash: refreshToken,
  });

  if (!validRefresh) return handleError('Invalid refresh token');

  const user = await userModel.findById(validRefresh.userId);
  if (!user) return handleError('User not found');

  const newAccessToken = authHelper.signAccessToken(user);
  if (!newAccessToken) return handleError('Access token signing failed');

  Logger.info('New access token signed successfully...');

  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: envConfig.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000,
  });

  req.user = user;
  res.locals.currentUser = user;
  next();
};
