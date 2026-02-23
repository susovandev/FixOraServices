import type { Request, Response } from 'express';
import Logger from '@config/logger.config.js';
import serviceCategoriesModel from 'models/service-categories.model.js';
class ServiceCategoryController {
  async getServiceCategoriesPage(req: Request, res: Response) {
    try {
      const serviceCategories = await serviceCategoriesModel.find();

      // const serviceCategories = [
      //   {
      //     _id: new mongoose.Types.ObjectId().toString(),
      //     name: 'Plumbing',
      //     icon: 'fa-solid fa-wrench',
      //     isActive: true,
      //     servicesCount: 10,
      //     createdAt: new Date(),
      //   },
      // ];
      return res.render('pages/admin/service-categories', {
        title: 'Admin | Service Categories',
        pageTitle: 'Service Categories',
        currentPath: '/admins/service-categories',
        admin: req?.user,
        totalUnreadNotifications: [],
        totalNotifications: [],
        notifications: [],
        serviceCategories,
      });
    } catch (error) {
      Logger.error(`Error in getServiceCategoriesPage: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/admin/login');
    }
  }

  async createServiceCategoryHandler(req: Request, res: Response) {
    try {
      Logger.info(
        `Create service category request received with body: ${JSON.stringify(req.body)}`
      );

      const { name, icon } = req.body;

      const newServiceCategory = await serviceCategoriesModel.create({
        name,
        icon,
      });

      Logger.info(`New service category created: ${JSON.stringify(newServiceCategory)}`);

      req.flash('success', 'Service category created successfully');
      return res.redirect('/admin/service-categories');
    } catch (error) {
      Logger.error(`Error in getServiceCategoriesPage: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/admin/service-categories');
    }
  }

  async updateServiceCategoryHandler(req: Request, res: Response) {
    try {
      Logger.info(
        `Update service category request received with body: ${JSON.stringify(req.body)}`
      );

      const serviceId = req.params.id;
      const { name, icon } = req.body;

      const updatedServiceCategory = await serviceCategoriesModel.findOneAndUpdate(
        { _id: serviceId },
        {
          name,
          icon,
        },
        { new: true }
      );

      if (!updatedServiceCategory) {
        throw new Error('Service category not found');
      }

      Logger.info('Service updated successfully');

      req.flash('success', 'Service category updated successfully');
      return res.redirect('/admin/service-categories');
    } catch (error) {
      Logger.error(`Error in getServiceCategoriesPage: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/admin/service-categories');
    }
  }

  async toggleServiceCategoryHandler(req: Request, res: Response) {
    try {
      Logger.info('Toggle service category request received');

      const serviceId = req.params.id;
      const serviceCategory = await serviceCategoriesModel.findOne({
        _id: serviceId,
      });

      if (!serviceCategory) {
        throw new Error('Service category not found');
      }

      serviceCategory.isActive = !serviceCategory.isActive;
      await serviceCategory.save();

      req.flash('success', 'Service category updated successfully');
      return res.redirect('/admin/service-categories');
    } catch (error) {
      Logger.error(`Error in getServiceCategoriesPage: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/admin/service-categories');
    }
  }

  async deleteServiceCategoryHandler(req: Request, res: Response) {
    try {
      Logger.info('Delete service category request received');

      const deletedServiceCategory = await serviceCategoriesModel.findByIdAndDelete({
        _id: req.params.id,
      });

      if (!deletedServiceCategory) {
        throw new Error('Service category not found');
      }

      req.flash('success', 'Service category deleted successfully');
      return res.redirect('/admin/service-categories');
    } catch (error) {
      Logger.error(`Error in getServiceCategoriesPage: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/admin/service-categories');
    }
  }
}

export default new ServiceCategoryController();
