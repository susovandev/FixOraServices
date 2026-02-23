import type { Application } from 'express';

import clientRoutes from './modules/client/routes/client.routes.js';
import adminRoutes from './modules/auth/routes/admin-auth.routes.js';

import adminDashboardRoutes from './modules/dashboard/routes/admin-dashboard.routes.js';
import adminServiceCategoriesRoutes from './modules/service-categories/routes/service-category.routes.js';
import adminServicesRoutes from './modules/services/routes/service.routes.js';
import adminPricingRoutes from './modules/pricing/routes/pricing.routes.js';

import technicianRoutes from './modules/technicians/routes/technicians.routes.js';

import servicesRoutes from './modules/services/routes/service.routes.js';

import { AuthGuardEJS } from '@middlewares/auth.middleware.js';
import { RoleGuardEJS } from '@middlewares/role-guard.middleware.js';
import { UserRole } from 'models/user.model.js';

export default function configureWebRoutes(app: Application) {
  app.use('/', clientRoutes);
  app.use('/admin', adminRoutes);
  app.use('/admin/dashboard', AuthGuardEJS, RoleGuardEJS(UserRole.ADMIN), adminDashboardRoutes);
  app.use(
    '/admin/service-categories',
    AuthGuardEJS,
    RoleGuardEJS(UserRole.ADMIN),
    adminServiceCategoriesRoutes
  );
  app.use('/admin/services', AuthGuardEJS, RoleGuardEJS(UserRole.ADMIN), adminServicesRoutes);
  app.use('/admin/pricing', AuthGuardEJS, RoleGuardEJS(UserRole.ADMIN), adminPricingRoutes);

  app.use('/technician', technicianRoutes);
  app.use('/services', servicesRoutes);
}
