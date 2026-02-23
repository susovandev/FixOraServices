import { Router } from 'express';
import technicianAuthController from '../controllers/technician-auth.controller.js';

import { upload } from '@config/multer.config.js';

const router: Router = Router();

router.get('/register', technicianAuthController.getRegisterPage);

router.get('/kyc', technicianAuthController.getKycPage);

router.post('/register', upload.single('profileImage'), technicianAuthController.registerHandler);

router.post('/kyc', upload.single('documents'), technicianAuthController.submitKycHandler);

export default router;
