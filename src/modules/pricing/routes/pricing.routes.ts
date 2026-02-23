import { Router } from 'express';
import pricingController from '../controllers/pricing.controller.js';
const router: Router = Router();

router.get('/', pricingController.getServicesPricingPage);

router.get('/:id/history', pricingController.getPricingHistory);
router.post('/', pricingController.createServicePricingHandler);
router.put('/:id', pricingController.updateServicePricingHandler);

export default router;
