import { Router } from 'express';

import serviceCategoryController from '../controllers/service.controller.js';
import servicesController from '../controllers/services.controller.js';
const router: Router = Router();

router.get('/', servicesController.getServicesPage);
router.get('/services', servicesController.getServicesPage);
router.get('/premium', servicesController.getPremiumServicesPage);
router.get('/appliances', servicesController.getAppliancesPage);
router.get('/:id', servicesController.getServiceDetailPage);

router.post('/', serviceCategoryController.createServiceHandler);
router.put('/:id', serviceCategoryController.updateServiceHandler);
router.put('/:id/toggle', serviceCategoryController.toggleServiceHandler);
router.delete('/:id', serviceCategoryController.deleteServiceHandler);

export default router;
