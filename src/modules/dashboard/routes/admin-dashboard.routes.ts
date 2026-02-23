import { Router } from 'express';
import adminDashboardController from '../controllers/admin-dashboard.controller.js';

const router: Router = Router();

router.get('/', adminDashboardController.getDashboard);

export default router;
