/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import envConfig from 'config/env.config.js';
import Logger from 'config/logger.config.js';
import {
  ACCESS_TOKEN_EXPIRATION_TIME,
  PASSWORD_HASH_SALT_ROUNDS,
  REFRESH_TOKEN_EXPIRATION_TIME,
} from 'constants/index.js';

interface IResetPasswordJwtPayload {
  sub: string;
}

class AuthHelper {
  async hashPasswordHelper(password: string): Promise<string | null> {
    Logger.debug('Hashing password...');
    const genSalt = await bcrypt.genSalt(PASSWORD_HASH_SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, genSalt);
    if (!hashedPassword) return null;
    return hashedPassword;
  }

  async comparePasswordHelper(password: string, hashedPassword: string): Promise<boolean> {
    Logger.debug('Comparing password...');
    if (!hashedPassword) return false;
    const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordCorrect) return false;
    return isPasswordCorrect;
  }

  generateRandomOtp(): number | null {
    Logger.debug('Generating verification code...');
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    if (!verificationCode) return null;
    return verificationCode;
  }
  async hashOtp(verifyOtp: string): Promise<string | null> {
    Logger.debug('Hashing verification code...');
    const genSalt = await bcrypt.genSalt(PASSWORD_HASH_SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(verifyOtp, genSalt);
    if (!hashedPassword) return null;
    return hashedPassword;
  }

  async verifyOtp(verificationCode: string, verificationCodeHash: string): Promise<boolean> {
    Logger.debug('Verifying verification code...');
    const isVerificationCodeCorrect = await bcrypt.compare(verificationCode, verificationCodeHash);
    if (!isVerificationCodeCorrect) return false;
    return isVerificationCodeCorrect;
  }

  signAccessToken(user: any): string | null {
    Logger.debug('Signing access token...');
    if (!user) return null;
    const payload: IResetPasswordJwtPayload = {
      sub: user._id.toString(),
    };
    const accessToken = jwt.sign(payload, envConfig.ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: ACCESS_TOKEN_EXPIRATION_TIME,
    } as jwt.SignOptions);
    if (!accessToken) return null;
    return accessToken;
  }

  signRefreshToken(user: any): string | null {
    Logger.debug('Signing refresh token...');
    if (!user) return null;
    const payload: IResetPasswordJwtPayload = {
      sub: user._id.toString(),
    };
    const refreshToken = jwt.sign(payload, envConfig.REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: REFRESH_TOKEN_EXPIRATION_TIME,
    } as jwt.SignOptions);
    if (!refreshToken) return null;
    return refreshToken;
  }

  signAccessTokenAndRefreshToken(user: any): { accessToken: string; refreshToken: string } | null {
    Logger.debug('Signing access token and refresh token...');
    if (!user) return null;

    const accessToken = this.signAccessToken(user);
    const refreshToken = this.signRefreshToken(user);
    if (!accessToken || !refreshToken) return null;
    return {
      accessToken,
      refreshToken,
    };
  }

  verifyAccessToken(token: string): jwt.JwtPayload | null {
    Logger.debug('Verifying access token...');
    const decoded = jwt.verify(token, envConfig.ACCESS_TOKEN_SECRET_KEY) as jwt.JwtPayload;
    if (!decoded) {
      return null;
    }
    return decoded;
  }

  verifyRefreshToken(token: string): jwt.JwtPayload | null {
    Logger.debug('Verifying refresh token...');
    const decoded = jwt.verify(token, envConfig.REFRESH_TOKEN_SECRET_KEY) as jwt.JwtPayload;
    if (!decoded) {
      return null;
    }
    return decoded;
  }
}

export default new AuthHelper();
