import type { Request, Response } from 'express';
import Logger from '@config/logger.config.js';
import servicesModel from 'models/services.model.js';
import serviceCategoriesModel from 'models/service-categories.model.js';
class ServiceController {
  async getServicesPage(req: Request, res: Response) {
    try {
      const services = await servicesModel.find();

      const categories = await serviceCategoriesModel.find().select('_id name');

      // const services = [
      //   {
      //     _id: new mongoose.Types.ObjectId().toString(),
      //     categoryName: 'Vehicle Services',
      //     name: 'Car Wash',
      //     baseDurationMinutes: 30,
      //     isActive: true,
      //     bookingCount: 10,
      //     createdAt: new Date(),
      //   },
      // ];
      return res.render('pages/admin/services', {
        title: 'Admin | Service Categories',
        pageTitle: 'Service Categories',
        currentPath: '/admin/services',
        admin: req?.user,
        totalUnreadNotifications: [],
        totalNotifications: [],
        notifications: [],
        services,
        categories,
      });
    } catch (error) {
      Logger.error(`Error in getServicePage: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/admin/login');
    }
  }

  async createServiceHandler(req: Request, res: Response) {
    try {
      Logger.info(`Create service  request received with body: ${JSON.stringify(req.body)}`);

      const { categoryId, name, description, baseDurationMinutes } = req.body;

      const newService = await servicesModel.create({
        categoryId,
        name,
        description,
        baseDurationMinutes,
      });

      Logger.info(`New service created with categoryId: ${newService.categoryId}`);

      req.flash('success', 'New service created successfully');
      return res.redirect('/admin/services');
    } catch (error) {
      Logger.error(`Error in getServiceCategoriesPage: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/admin/services');
    }
  }

  async updateServiceHandler(req: Request, res: Response) {
    try {
      Logger.info(`Update service  request received with body: ${JSON.stringify(req.body)}`);

      const serviceId = req.params.id;
      const { categoryId, name, description, baseDurationMinutes } = req.body;

      const updatedService = await servicesModel.findOneAndUpdate(
        { _id: serviceId },
        {
          categoryId,
          name,
          description,
          baseDurationMinutes,
        },
        { new: true }
      );

      if (!updatedService) {
        throw new Error('Service not found');
      }

      Logger.info('Service updated successfully');

      req.flash('success', 'Service updated successfully');
      return res.redirect('/admin/services');
    } catch (error) {
      Logger.error(`Error in getServicesPage: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/admin/services');
    }
  }

  async toggleServiceHandler(req: Request, res: Response) {
    try {
      Logger.info('Toggle service category request received');

      const serviceId = req.params.id;
      const serviceRecord = await servicesModel.findOne({
        _id: serviceId,
      });

      if (!serviceRecord) {
        throw new Error('Service not found');
      }

      serviceRecord.isActive = !serviceRecord.isActive;
      await serviceRecord.save();

      req.flash('success', 'Service status updated successfully');
      return res.redirect('/admin/services');
    } catch (error) {
      Logger.error(`Error in getServiceCategoriesPage: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/admin/services');
    }
  }

  async deleteServiceHandler(req: Request, res: Response) {
    try {
      Logger.info('Delete service  request received');

      const deletedServiceRecord = await servicesModel.findByIdAndDelete({
        _id: req.params.id,
      });

      if (!deletedServiceRecord) {
        throw new Error('Service not found');
      }

      req.flash('success', 'Service deleted successfully');
      return res.redirect('/admin/services');
    } catch (error) {
      Logger.error(`Error in getServicePage: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/admin/service');
    }
  }
}

export default new ServiceController();
