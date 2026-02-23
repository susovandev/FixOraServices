import Logger from 'config/logger.config.js';
import type { Request, Response } from 'express';
import userModel, { UserRole } from 'models/user.model.js';
import authHelper from '../auth.helper.js';
import envConfig from 'config/env.config.js';
import { ACCESS_TOKEN_EXPIRATION_TIME, REFRESH_TOKEN_EXPIRATION_TIME } from 'constants/index.js';
import refreshTokenModel from 'models/refresh-token.model.js';
class AdminAuthController {
  async getLoginPage(req: Request, res: Response) {
    res.render('pages/admin/login', { title: 'Admin Login' });
  }

  async loginHandler(req: Request, res: Response) {
    try {
      Logger.info(`Admin login request received with body: ${JSON.stringify(req.body)}`);
      const { email, password } = req.body;

      const normalizedEmail = email.trim().toLowerCase();

      const admin = await userModel.findOne({
        email: normalizedEmail,
        role: UserRole.ADMIN,
        isAccountVerified: true,
      });

      if (!admin) {
        throw new Error('Invalid email or password');
      }

      // const isPasswordValid = await authHelper.comparePasswordHelper(
      //   password,
      //   admin?.passwordHash as string
      // );

      // if (!isPasswordValid) {
      //   throw new Error('Invalid password');
      // }

      const tokens = authHelper.signAccessTokenAndRefreshToken(admin);
      if (!tokens) {
        throw new Error('Failed to sign access token');
      }

      const { accessToken, refreshToken } = tokens;

      await refreshTokenModel.create({
        userId: admin?._id,
        tokenHash: refreshToken,
        expiresAt: REFRESH_TOKEN_EXPIRATION_TIME,
      });

      req.flash('success', 'Login successful');
      return res
        .cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: envConfig.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: ACCESS_TOKEN_EXPIRATION_TIME,
        })
        .cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: envConfig.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: REFRESH_TOKEN_EXPIRATION_TIME,
        })
        .redirect('/admin/dashboard');
    } catch (error) {
      Logger.error(`Admin login error: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      res.redirect('/admin/login');
    }
  }

  async logoutHandler(req: Request, res: Response) {
    try {
      const adminId = req?.user?._id;

      await refreshTokenModel.deleteMany({ userId: adminId });

      req.flash('success', 'Logged out successfully');
      //Clear cookies
      return res.clearCookie('refreshToken').clearCookie('accessToken').redirect('/admin/login');
    } catch (error) {
      Logger.error(`Admin logout error: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      res.redirect('/admin/login');
    }
  }
}

export default new AdminAuthController();
