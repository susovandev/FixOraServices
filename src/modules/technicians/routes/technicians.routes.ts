import { Router } from 'express';
import techniciansController from '../controllers/technicians.controller.js';
import { AuthGuardEJS } from '@middlewares/auth.middleware.js';
import { upload } from '@config/multer.config.js';

const router: Router = Router();

router.get('/login', techniciansController.getLoginPage);
router.get('/', techniciansController.getTechnicianIndexPage);
router.get('/verify-phone', techniciansController.getVerificationPhonePage);
router.get('/basic-info', techniciansController.getBasicInfoPage);
router.get('/service-info', techniciansController.getServiceInfoPage);
router.get('/kyc', techniciansController.getKycPage);

router.get('/dashboard', AuthGuardEJS, techniciansController.getDashboard);
router.get('/bookings', techniciansController.getBookingPage);
router.get('/earnings', techniciansController.getEarningPage);
router.get('/reviews', techniciansController.getReviewPage);
router.get('/account', techniciansController.getAccountPage);

router.get('/api/cities/:stateId', techniciansController.getCitiesByState);

router.post('/register', techniciansController.registerTechnicianHandler);
router.post('/login', techniciansController.loginHandler);
router.post('/verify-otp', techniciansController.verifyOtpHandler);
router.post('/resend-otp', techniciansController.resendOtpHandler);
router.post(
  '/basic-info',
  AuthGuardEJS,
  upload.single('profileImage'),
  techniciansController.saveBasicInfoHandler
);
router.post('/service-info', AuthGuardEJS, techniciansController.saveServiceInfoHandler);
router.post(
  '/kyc',
  AuthGuardEJS,
  upload.fields([
    { name: 'aadhaarFrontImage', maxCount: 1 },
    { name: 'aadhaarBackImage', maxCount: 1 },
    { name: 'panCardImage', maxCount: 1 },
  ]),
  techniciansController.saveKycHandler
);

router.post('/logout', AuthGuardEJS, techniciansController.logoutHandler);

export default router;
