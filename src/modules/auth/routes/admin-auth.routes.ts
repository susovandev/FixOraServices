import { Router } from 'express';

import adminAuthController from '../controllers/admin-auth.controller.js';

const router: Router = Router();

router.get('/login', adminAuthController.getLoginPage);

router.post('/login', adminAuthController.loginHandler);

router.get('/logout', adminAuthController.logoutHandler);

export default router;
