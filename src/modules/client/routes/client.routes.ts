import { Router } from 'express';
import clientController from '../controllers/client.controller.js';
// import { upload } from '@config/multer.config.js';
import { OptionalAuthEJS, UserGuardEJS } from '@middlewares/auth.middleware.js';

const router: Router = Router();

router.get('/', OptionalAuthEJS, clientController.getIndexPage);
router.get('/login', clientController.getLoginPage);
router.get('/verify-phone', clientController.getVerifyPhonePage);

router.get('/about', OptionalAuthEJS, clientController.getAboutPage);
router.get('/career', OptionalAuthEJS, clientController.getCareerPage);
router.get('/career/:id', OptionalAuthEJS, clientController.getCareerDetail);
router.get('/terms', OptionalAuthEJS, clientController.getTermsPage);
router.get('/privacy', OptionalAuthEJS, clientController.getPrivacyPage);
// router.post(
//   '/career/:id/apply',
//   OptionalAuthEJS,
//   upload.single('resume'),
//   clientController.
// );

router.get('/contact', OptionalAuthEJS, clientController.getContactPage);
router.get('/cart', OptionalAuthEJS, clientController.getCartPage);

router.get('/payment-success', clientController.paymentSuccessHandler);

router.post('/login', clientController.loginHandler);
router.post('/verify-otp', clientController.verifyOtpHandler);
router.post('/resend-otp', clientController.resendOtpHandler);
router.post('/api/wishlist/add', UserGuardEJS, clientController.addToWishlistHandler);
router.post('/api/coupon/apply', UserGuardEJS, clientController.applyCouponHandler);

router.post('/payment/create-order', UserGuardEJS, clientController.createOrderHandler);
router.post('/payment/verify', UserGuardEJS, clientController.verifyPayment);
router.post('/payment-success', UserGuardEJS, clientController.paymentSuccessHandler);
router.put('/cart/update/:serviceId', UserGuardEJS, clientController.updateCartHandler);
router.delete('/cart/remove/:serviceId', UserGuardEJS, clientController.removeFromCartHandler);

router.get('/logout', clientController.logoutHandler);

export default router;
