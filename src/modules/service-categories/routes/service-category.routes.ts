import { Router } from 'express';

import serviceCategoryController from '../controllers/service-category.controller.js';
const router: Router = Router();

router.get('/', serviceCategoryController.getServiceCategoriesPage);

router.post('/', serviceCategoryController.createServiceCategoryHandler);
router.put('/:id', serviceCategoryController.updateServiceCategoryHandler);
router.put('/:id/toggle', serviceCategoryController.toggleServiceCategoryHandler);
router.delete('/:id', serviceCategoryController.deleteServiceCategoryHandler);

export default router;
