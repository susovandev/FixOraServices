import type { Request, Response } from 'express';
import Logger from '@config/logger.config.js';
import servicePricingModel from 'models/service-pricing.model.js';
import servicesModel from 'models/services.model.js';
import servicePricingHistoryModel from 'models/pricing-history.model.js';
class PricingController {
  async getServicesPricingPage(req: Request, res: Response) {
    try {
      const pricing = await servicePricingModel.find().populate('serviceId');
      const services = await servicesModel.find();
      console.log(services);
      const indianCities = [
        'Mumbai',
        'Delhi',
        'Bengaluru',
        'Hyderabad',
        'Chennai',
        'Kolkata',
        'Pune',
        'Ahmedabad',
        'Jaipur',
        'Chandigarh',
        'Indore',
        'Bhopal',
        'Lucknow',
        'Kanpur',
        'Patna',
        'Ranchi',
        'Bhubaneswar',
        'Cuttack',
        'Vizag',
        'Vijayawada',
        'Kochi',
        'Trivandrum',
        'Coimbatore',
        'Madurai',
        'Trichy',
        'Trivandrum',
        'Trivandrum',
        'Noida',
        'Gurgaon',
        'Faridabad',
      ];

      return res.render('pages/admin/service-pricing', {
        title: 'Admin | Service Pricing',
        pageTitle: 'Service Pricing',
        currentPath: '/admins/pricing',
        admin: req?.user,
        totalUnreadNotifications: [],
        totalNotifications: [],
        notifications: [],
        pricing,
        services,
        indianCities,
      });
    } catch (error) {
      Logger.error(`Error in getServiceCategoriesPage: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/admin/login');
    }
  }

  async getPricingHistory(req: Request, res: Response) {
    try {
      Logger.info(`Get pricing history request received`);

      const pricingId = req.params.id;

      const pricingHistory = await servicePricingHistoryModel
        .find({ pricingId: pricingId })
        .sort({ changedAt: -1 })
        .populate('changedBy', 'name');

      return res.json(pricingHistory);
    } catch (error) {
      Logger.error(`Error in getServiceCategoriesPage: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/admin/login');
    }
  }

  async createServicePricingHandler(req: Request, res: Response) {
    try {
      Logger.info(`Create service pricing request received with body: ${JSON.stringify(req.body)}`);

      const { serviceId, city, basePrice, commissionPercent, extraChargesAllowed } = req.body;

      const newServicePricing = await servicePricingModel.create({
        serviceId,
        city,
        basePrice,
        commissionPercent,
        extraChargesAllowed: extraChargesAllowed === 'on',
        lastUpdatedByAdmin: req?.user?._id,
      });

      Logger.info(`New service pricing created with serviceId: ${newServicePricing.serviceId}`);

      req.flash('success', 'New service pricing created successfully');
      return res.redirect('/admin/pricing');
    } catch (error) {
      Logger.error(`Error in getServicePricingPage: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/admin/pricing');
    }
  }

  async updateServicePricingHandler(req: Request, res: Response) {
    try {
      const serviceId = req.params.id;
      const { city, basePrice, commissionPercent, extraChargesAllowed } = req.body;

      const existingPricing = await servicePricingModel.findById(serviceId);
      if (!existingPricing) {
        throw new Error('Service pricing not found');
      }

      const updatedPricing = await servicePricingModel.findByIdAndUpdate(
        serviceId,
        {
          city,
          basePrice,
          commissionPercent,
          extraChargesAllowed: extraChargesAllowed === 'on',
        },
        { new: true }
      );

      await servicePricingHistoryModel.create({
        pricingId: updatedPricing!._id,
        serviceId: updatedPricing!.serviceId,
        city: updatedPricing!.city,

        oldPrice: existingPricing.basePrice,
        newPrice: basePrice,

        oldCommission: existingPricing.commissionPercent,
        newCommission: commissionPercent,

        oldExtraChargesAllowed: existingPricing.extraChargesAllowed,
        newExtraChargesAllowed: extraChargesAllowed === 'on',

        changedBy: req.user?._id,
        changeReason: 'Admin update',
        changedAt: new Date(),
      });

      req.flash('success', 'Service pricing updated successfully');
      return res.redirect('/admin/pricing');
    } catch (error) {
      Logger.error(error);
      req.flash('error', (error as Error).message);
      return res.redirect('/admin/pricing');
    }
  }
}

export default new PricingController();
