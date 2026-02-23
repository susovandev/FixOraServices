/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import type { Request, Response } from 'express';
import servicesModel from 'models/services.model.js';
import Logger from '@config/logger.config.js';
import serviceCategoriesModel from 'models/service-categories.model.js';

class ServicesController {
  async getServicesPage(req: Request, res: Response) {
    try {
      const query = req.query.search ? { name: { $regex: req.query.search, $options: 'i' } } : {};

      const { categoryId } = req.query;

      const filterQuery: {
        [key: string]: boolean | string;
      } = {
        instant: true,
      };

      if (categoryId) {
        filterQuery.categoryId = categoryId as string;
      }

      const [categories, services] = await Promise.all([
        serviceCategoriesModel.find().select('_id name icon').lean(),
        servicesModel.find(filterQuery).populate({
          path: 'pricingId',
          select: {
            _id: 1,
            basePrice: 1,
            city: 1,
          },
        }),
      ]);

      return res.render('pages/services', {
        user: null,
        categories: categories,
        services: services,
        search: query,
        categoryId,
        totalPages: Math.ceil(services.length / 10),
        page: 1,
      });
    } catch (error) {
      Logger.error(`Error in getServicesPage: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/');
    }
  }

  async getPremiumServicesPage(req: Request, res: Response) {
    try {
      return res.render('pages/premium-services', {
        user: null,
        plans: {
          month1: { price: 999 },
          month6: { price: 4999 },
          month12: { price: 8999 },
        },
      });
    } catch (error) {
      Logger.error(`Error in getServicesPage: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/');
    }
  }

  async getAppliancesPage(req: Request, res: Response) {
    try {
      const { serviceName } = req.query;

      const query: {
        [key: string]: string;
      } = {};

      if (serviceName) {
        const formattedServiceName = (serviceName as string).replace(/%20/g, ' ');
        query.name = formattedServiceName;
      }

      const [appliances, uniqueAppliances] = await Promise.all([
        servicesModel.aggregate([
          {
            $match: query,
          },
          {
            $lookup: {
              from: 'servicecategories',
              localField: 'categoryId',
              foreignField: '_id',
              as: 'category',
            },
          },
          {
            $unwind: '$category',
          },
          {
            $lookup: {
              from: 'servicepricings',
              localField: 'pricingId',
              foreignField: '_id',
              as: 'pricing',
            },
          },
          {
            $unwind: '$pricing',
          },
          {
            $match: {
              'category.name': 'Appliances',
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              description: 1,
              images: 1,
              instant: 1,
              baseDurationMinutes: 1,
              basePrice: '$pricing.basePrice',
            },
          },
        ]),
        servicesModel.distinct('name'),
      ]);

      return res.render('pages/appliances', { user: null, appliances, uniqueAppliances });
    } catch (error) {
      Logger.error(`Error in getServicesPage: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/');
    }
  }

  async getServiceDetailPage(req: Request, res: Response) {
    try {
      const serviceId = req.params.id;

      const service = await servicesModel.findById(serviceId).populate({
        path: 'pricingId',
        select: {
          _id: 1,
          basePrice: 1,
          city: 1,
        },
      });

      return res.render('pages/service-detail', {
        user: null,
        service,
        reviews: [
          {
            _id: '1',
            username: 'John Doe',
            rating: 5,
            comment: 'Great service! Highly recommended.',
          },
          {
            _id: '2',
            username: 'Jane Smith',
            rating: 4,
            comment: 'Good service, but could be better.',
          },
          {
            _id: '3',
            username: 'Bob Johnson',
            rating: 3,
            comment: 'Average service, nothing special.',
          },
          {
            _id: '1',
            username: 'John Doe',
            rating: 5,
            comment: 'Great service! Highly recommended.',
          },
          {
            _id: '2',
            username: 'Jane Smith',
            rating: 4,
            comment: 'Good service, but could be better.',
          },
          {
            _id: '3',
            username: 'Bob Johnson',
            rating: 3,
            comment: 'Average service, nothing special.',
          },
          {
            _id: '1',
            username: 'John Doe',
            rating: 5,
            comment: 'Great service! Highly recommended.',
          },
          {
            _id: '2',
            username: 'Jane Smith',
            rating: 4,
            comment: 'Good service, but could be better.',
          },
          {
            _id: '3',
            username: 'Bob Johnson',
            rating: 3,
            comment: 'Average service, nothing special.',
          },
          {
            _id: '1',
            username: 'John Doe',
            rating: 5,
            comment: 'Great service! Highly recommended.',
          },
          {
            _id: '2',
            username: 'Jane Smith',
            rating: 4,
            comment: 'Good service, but could be better.',
          },
          {
            _id: '3',
            username: 'Bob Johnson',
            rating: 3,
            comment: 'Average service, nothing special.',
          },
          {
            _id: '1',
            username: 'John Doe',
            rating: 5,
            comment: 'Great service! Highly recommended.',
          },
          {
            _id: '2',
            username: 'Jane Smith',
            rating: 4,
            comment: 'Good service, but could be better.',
          },
          {
            _id: '3',
            username: 'Bob Johnson',
            rating: 3,
            comment: 'Average service, nothing special.',
          },
          {
            _id: '1',
            username: 'John Doe',
            rating: 5,
            comment: 'Great service! Highly recommended.',
          },
          {
            _id: '2',
            username: 'Jane Smith',
            rating: 4,
            comment: 'Good service, but could be better.',
          },
          {
            _id: '3',
            username: 'Bob Johnson',
            rating: 3,
            comment: 'Average service, nothing special.',
          },
          {
            _id: '1',
            username: 'John Doe',
            rating: 5,
            comment: 'Great service! Highly recommended.',
          },
          {
            _id: '2',
            username: 'Jane Smith',
            rating: 4,
            comment: 'Good service, but could be better.',
          },
          {
            _id: '3',
            username: 'Bob Johnson',
            rating: 3.2,
            comment: 'Average service, nothing special.',
          },
        ],
      });
    } catch (error) {
      Logger.error(`Error in getServiceDetailPage: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/');
    }
  }
}
export default new ServicesController();
