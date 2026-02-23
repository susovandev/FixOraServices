import Logger from 'config/logger.config.js';
import type { Request, Response } from 'express';
class AdminDashboardController {
  async getDashboard(req: Request, res: Response) {
    try {
      return res.render('pages/admin/dashboard', {
        title: 'Admin Dashboard',
        pageTitle: 'Dashboard',
        pageDesc: 'Manage your dashboard',
        currentPath: '/admin/dashboard',
        admin: req?.user,
        totalUnreadNotifications: [],
        totalNotifications: [],
        notifications: [],
      });
    } catch (error) {
      Logger.error(`Error in getDashboard: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/admin/login');
    }
  }
}

export default new AdminDashboardController();
