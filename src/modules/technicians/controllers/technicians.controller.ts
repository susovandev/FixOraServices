/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import Logger from '@config/logger.config.js';
import authHelper from '@modules/auth/auth.helper.js';
import { uploadOnCloudinary } from '@utils/cloudinary.js';
import {
  ACCESS_TOKEN_EXPIRATION_TIME,
  REFRESH_TOKEN_EXPIRATION_TIME,
  VERIFICATION_CODE_EXPIRES_IN,
} from 'constants/index.js';
import type { Request, Response } from 'express';
import sendSMS, { formatPhoneNumber } from 'helper/twilio.helper.js';
import bookingAssignmentModel, {
  BookingAssignmentStatus,
} from 'models/booking-assignment.model.js';
import cityModel from 'models/city.model.js';
import refreshTokenModel from 'models/refresh-token.model.js';
import reviewModel from 'models/review.model.js';
import servicesModel from 'models/services.model.js';
import statesModel from 'models/states.model.js';
import technicianBankAccountModel from 'models/technician-bank-account.model.js';
import technicianKycModel from 'models/technician-kyc.model.js';
import techniciansModel, { TechnicianWorkingDays } from 'models/technicians.model.js';
import verificationModel, { VerificationType } from 'models/verification.model.js';
import mongoose from 'mongoose';

class TechniciansController {
  async getTechnicianIndexPage(req: Request, res: Response) {
    return res.render('pages/technician/index', {
      title: 'Technician | FixOra',
    });
  }

  async getVerificationPhonePage(req: Request, res: Response) {
    return res.render('pages/technician/verify-phone', {
      phone: req.session?.technicianDetails?.phone,
      title: 'Technician Verification',
    });
  }

  async getResendOtpPage(req: Request, res: Response) {
    return res.render('pages/technician/resend-otp', {
      title: 'Technician Resend OTP',
      phone: req.query.phone || +919002180088,
    });
  }

  async getLoginPage(req: Request, res: Response) {
    return res.render('pages/technician/login', {
      title: 'Technician Login',
    });
  }

  async getBasicInfoPage(req: Request, res: Response) {
    try {
      const states = await statesModel.find().select('_id name').sort({ name: 1 }).lean();
      const cities = await cityModel.find().select('_id name').sort({ name: 1 }).lean();

      return res.render('pages/technician/basic-info', {
        title: 'Technician Basic Info',
        phone: req.session.technicianDetails?.phone,
        states,
        cities,
      });
    } catch (error) {
      Logger.error(`Error in getBasicInfoPage: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      res.redirect('/technicians/');
    }
  }

  async getCitiesByState(req: Request, res: Response) {
    try {
      Logger.info(
        `Get cities by state request received with params: ${JSON.stringify(req.params)}`
      );
      const { stateId } = req.params;

      const cities = await cityModel
        .find({ state: stateId })
        .select('_id name')
        .sort({ name: 1 })
        .lean();

      res.json({
        success: true,
        data: cities,
      });
    } catch (error) {
      Logger.error(error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cities',
      });
    }
  }

  async getServiceInfoPage(req: Request, res: Response) {
    try {
      const services = await servicesModel.find().select('_id name').lean();
      return res.render('pages/technician/service-info', {
        title: 'Technician Service Info',
        services,
        workingDays: [
          TechnicianWorkingDays.SUNDAY,
          TechnicianWorkingDays.MONDAY,
          TechnicianWorkingDays.TUESDAY,
          TechnicianWorkingDays.WEDNESDAY,
          TechnicianWorkingDays.THURSDAY,
          TechnicianWorkingDays.FRIDAY,
          TechnicianWorkingDays.SATURDAY,
        ],
      });
    } catch (error) {
      Logger.error(`Error in getBasicInfoPage: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      res.redirect('/technicians/');
    }
  }

  async getKycPage(req: Request, res: Response) {
    return res.render('pages/technician/kyc', {
      title: 'Technician KYC',
      kyc: null,
    });
  }

  async getDashboard(req: Request, res: Response) {
    try {
      const technicianId = req?.user?._id;

      /*
      [
  {
    "_id": "699401c60f40e6c3c973685e",
    "bookingId": "65d1a0000000000000000001",
    "technicianId": "6992d78f4760a88fdd36139d",
    "assignedAt": "2026-02-17T10:10:00.000Z",
    "status": "assigned",
    "createdAt": "2026-02-17T10:10:00.000Z",
    "updatedAt": "2026-02-17T10:10:00.000Z",
    "booking": {
      "_id": "65d1a0000000000000000001",
      "bookingCode": "BK-1001",
      "customerId": "69898f10d02674622cb02ffc",
      "serviceId": "698ae16777bf03af8b1cc9c8",
      "pricingSnapshot": {
        "basePrice": 499,
        "commissionPercent": 15
      },
      "address": {
        "line1": "Salt Lake Sector V",
        "city": "Kolkata",
        "pincode": "700091",
        "location": {
          "type": "Point",
          "coordinates": [
            88.4172,
            22.5726
          ]
        }
      },
      "scheduledAt": "2026-02-18T10:00:00.000Z",
      "status": "pending",
      "createdAt": "2026-02-17T10:00:00.000Z",
      "updatedAt": "2026-02-17T10:00:00.000Z"
    },
    "service": {
      "_id": "698ae16777bf03af8b1cc9c8",
      "categoryId": "698ad4b4ffd3d00afc82cee5",
      "name": "Bike Wash",
      "description": "Clean bike wash service provided within 1 hours",
      "baseDurationMinutes": 120,
      "isActive": true,
      "createdAt": "2026-02-10T07:42:31.539Z",
      "updatedAt": "2026-02-10T08:41:21.319Z",
      "__v": 0
    },
    "customer": [
      {
        "_id": "69898f10d02674622cb02ffc",
        "phone": "+917908053245",
        "role": "ADMIN",
        "status": "PENDING",
        "isAccountVerified": true,
        "lastLoginAt": null,
        "createdAt": "2026-02-09T07:38:56.704Z",
        "updatedAt": "2026-02-09T07:38:56.704Z",
        "email": "susovandas985@gmail.com",
        "passwordHash": "12345678"
      }
    ]
  }
]
         */

      const technicianRecord = await techniciansModel.findOne({ _id: technicianId }).lean();

      // Upcoming Bookings
      const upcomingBookings = await bookingAssignmentModel.aggregate([
        {
          $match: {
            technicianId: new mongoose.Types.ObjectId(technicianRecord?._id),
            status: BookingAssignmentStatus.ASSIGNED,
          },
        },
        {
          $lookup: {
            from: 'bookings',
            localField: 'bookingId',
            foreignField: '_id',
            as: 'booking',
          },
        },
        {
          $unwind: '$booking',
        },
        {
          $lookup: {
            from: 'services',
            localField: 'booking.serviceId',
            foreignField: '_id',
            as: 'service',
          },
        },
        {
          $unwind: '$service',
        },
        {
          $lookup: {
            from: 'users',
            localField: 'booking.customerId',
            foreignField: '_id',
            as: 'customer',
          },
        },
        {
          $unwind: '$customer',
        },
        {
          $project: {
            _id: 1,
            customerName: '$customer.name',
            serviceName: '$service.name',
            date: '$booking.scheduledAt',
            status: 1,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      // Pending Bookings
      const totalPendingBookings = await bookingAssignmentModel.countDocuments({
        technicianId: technicianRecord?._id,
        status: BookingAssignmentStatus.PENDING,
      });

      // Completed Bookings
      const totalCompletedBookings = await bookingAssignmentModel.countDocuments({
        technicianId: technicianRecord?._id,
        status: BookingAssignmentStatus.COMPLETED,
      });

      // Kyc Record
      const kycRecord = await technicianKycModel
        .findOne({ technicianId: technicianRecord?._id })
        .lean();

      // Bank Record
      const bankRecord = await technicianBankAccountModel
        .findOne({
          technicianId: technicianRecord?._id,
        })
        .lean();

      // Reviews
      const reviews = await reviewModel
        .find({ technicianId: technicianRecord?._id })
        .select({
          _id: 1,
          rating: 1,
          comment: 1,
          createdAt: 1,
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      return res.render('pages/technician/dashboard', {
        technician: technicianRecord || { name: 'Susovan Dev' },
        kycStatus: kycRecord ? kycRecord.kycStatus : 'Pending',
        bankStatus: bankRecord ? bankRecord.bankStatus : 'Pending',
        stats: {
          pending: totalPendingBookings,
          completed: totalCompletedBookings,
          rating: technicianRecord?.rating,
          earnings: technicianRecord?.totalEarnings,
        },
        profilePercent: 50,
        upcomingBookings: upcomingBookings,
        earningsGraph: [20, 30, 40, 50, 40, 30, 20],
        reviews: reviews,
      });
    } catch (error) {
      Logger.error(`Error in getDashboard: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      res.redirect('/technicians/');
    }
  }

  async getBookingPage(req: Request, res: Response) {
    return res.render('pages/technician/technician-booking', {
      technician: {},
      bookings: [],
      query: req.query,
    });
  }

  async getEarningPage(req: Request, res: Response) {
    res.render('pages/technician/earnings', {
      technician: {},
      earnings: {
        total: 52000,
        month: 8200,
        available: 4300,
      },
      earningsGraph: [40, 70, 30, 90, 60, 50, 80],
      transactions: [
        {
          serviceName: 'AC Repair',
          customerName: 'Rahul Sharma',
          date: '12 Feb 2026',
          amount: 1200,
          status: 'paid',
        },
      ],
    });
  }

  async getReviewPage(req: Request, res: Response) {
    res.render('pages/technician/reviews', {
      technician: {},
      rating: {
        avg: 4.6,
        count: 32,
        fiveStar: 24,
      },
      reviews: [
        {
          customerId: '123',
          customerName: 'Rahul Sharma',
          rating: 5,
          comment: 'Very professional and fixed quickly.',
          createdAt: new Date(),
        },
      ],
    });
  }

  async getAccountPage(req: Request, res: Response) {
    res.render('pages/technician/account', {
      technician: {},
      account: {
        kyc: true,
        bank: false,
      },
    });
  }

  async registerTechnicianHandler(req: Request, res: Response) {
    try {
      const { phone } = req.body;
      const formattedPhone = formatPhoneNumber(phone);

      const isPhoneExists = await techniciansModel.findOne({
        'basicInfo.phone': formattedPhone,
      });
      if (isPhoneExists) {
        throw new Error('Your technician request is already submitted');
      }

      const newTechnicianRecord = await techniciansModel.create({
        basicInfo: { phone: formattedPhone },
      });

      const signRandomOtp = authHelper.generateRandomOtp();
      if (!signRandomOtp) {
        throw new Error('Failed to generate verification code');
      }

      const hashedOtp = await authHelper.hashOtp(signRandomOtp?.toString());
      if (!hashedOtp) {
        throw new Error('Failed to hash verification code');
      }

      await verificationModel.create({
        userId: newTechnicianRecord._id,
        verificationType: VerificationType.REGISTER,
        verificationCode: hashedOtp,
        verificationCodeExpiration: new Date(Date.now() + VERIFICATION_CODE_EXPIRES_IN),
      });

      await sendSMS({
        body: `Your verification code is ${signRandomOtp}, please enter it to complete registration.`,
        to: formattedPhone,
      });

      req.session.technicianDetails = {
        _id: newTechnicianRecord._id,
        phone: formattedPhone,
      };

      req.flash(
        'success',
        `Your verification code has been sent to ${formattedPhone}. Please enter it to complete registration.`
      );

      return res.redirect('/technician/verify-phone');
    } catch (error) {
      Logger.error(`Error in registerTechnicianHandler: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/technician/');
    }
  }

  async verifyOtpHandler(req: Request, res: Response) {
    try {
      Logger.info(`Verify otp request received with body: ${JSON.stringify(req.body)}`);

      const { phone, otp } = req.body;

      const formattedPhone = formatPhoneNumber(phone);
      const sanitizeOtp = String(otp.join('').trim());

      const technicianRecord = await techniciansModel.findOne({
        'basicInfo.phone': formattedPhone,
      });
      if (!technicianRecord) {
        throw new Error('Your account is not registered Please register first');
      }

      // if (technicianRecord.isPhoneVerified) {
      //   throw new Error('Your account is already verified please login');
      // }

      const verificationCodeRecord = await verificationModel.findOne({
        userId: technicianRecord._id,
        verificationType: {
          $in: [VerificationType.REGISTER, VerificationType.LOGIN],
        },
        verificationCodeExpiration: { $gt: new Date() },
      });

      if (!verificationCodeRecord) {
        throw new Error('Invalid otp please try again');
      }

      const isOtpVerified = await authHelper.verifyOtp(
        sanitizeOtp,
        verificationCodeRecord.verificationCode
      );
      if (!isOtpVerified) {
        throw new Error('Invalid otp please try again');
      }

      req.session.technicianDetails = {
        _id: technicianRecord._id,
        phone: formattedPhone,
      };

      const tokens = authHelper.signAccessTokenAndRefreshToken(technicianRecord);
      if (!tokens) {
        throw new Error('Failed to generate tokens');
      }

      const { accessToken, refreshToken } = tokens;

      await refreshTokenModel.create({
        userId: technicianRecord._id,
        tokenHash: refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_TIME),
      });

      req.flash('success', 'Your account is verified successfully, Please fill your details');

      if (verificationCodeRecord.verificationType === VerificationType.REGISTER) {
        return res
          .cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: ACCESS_TOKEN_EXPIRATION_TIME,
          })
          .cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: REFRESH_TOKEN_EXPIRATION_TIME,
          })
          .redirect('/technician/basic-info');
      }
      return res
        .cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          maxAge: ACCESS_TOKEN_EXPIRATION_TIME,
        })
        .cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          maxAge: REFRESH_TOKEN_EXPIRATION_TIME,
        })
        .redirect('/technician/dashboard');
    } catch (error) {
      Logger.error(`Error in verifyOtpHandler: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/technician/verify-phone');
    }
  }

  async resendOtpHandler(req: Request, res: Response) {
    const { phone } = req.body;

    try {
      const formattedPhone = formatPhoneNumber(phone);

      const technicianRecord = await techniciansModel.findOne({
        'basicInfo.phone': formattedPhone,
      });

      if (!technicianRecord) {
        throw new Error(
          'Your account is not eligible for OTP verification, please contact support'
        );
      }

      if (technicianRecord.isPhoneVerified) {
        throw new Error('Your account is already verified please login');
      }

      const latestOtp = await verificationModel
        .findOne({
          userId: technicianRecord._id,
          verificationType: VerificationType.REGISTER,
        })
        .sort({ createdAt: -1 });

      const now = new Date();

      if (latestOtp && latestOtp.verificationCodeExpiration > now) {
        throw new Error('OTP already sent. Please wait before requesting a new one.');
      }

      const otp = authHelper.generateRandomOtp();
      if (!otp) throw new Error('Failed to generate verification code');

      const hashedOtp = await authHelper.hashOtp(otp.toString());
      if (!hashedOtp) throw new Error('Failed to hash verification code');

      await verificationModel.create({
        userId: technicianRecord._id,
        verificationCode: hashedOtp,
        verificationType: VerificationType.REGISTER,
        verificationCodeExpiration: new Date(Date.now() + VERIFICATION_CODE_EXPIRES_IN),
      });

      await sendSMS({
        body: `Your OTP is ${otp}. It expires soon.`,
        to: technicianRecord.basicInfo.phone,
      });

      req.flash('success', 'A new OTP has been sent to your phone');
      return res.redirect('/technician/');
    } catch (error) {
      Logger.error(`Error in userResendOTPHandler: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/technician/verify-phone');
    }
  }

  async saveBasicInfoHandler(req: Request, res: Response) {
    try {
      Logger.info(`Save basic info request received with body: ${JSON.stringify(req.body)}`);

      const technicianId = req.user?._id;

      const { fullName, email, state, city, address, serviceRadiusKm, location } = req.body;
      const profilePhotoLocalFilePath = req.file?.path;

      if (!profilePhotoLocalFilePath) {
        throw new Error('Profile photo is required');
      }

      const cloudinaryResponse = await uploadOnCloudinary({
        localFilePath: profilePhotoLocalFilePath,
        uploadFolder: 'technicians/profile-photos',
      });
      if (!cloudinaryResponse) {
        throw new Error('Failed to upload profile photo on cloudinary');
      }

      const technicianRecord = await techniciansModel.findByIdAndUpdate(
        technicianId,
        {
          'basicInfo.fullName': fullName,
          'basicInfo.email': email || undefined,
          'basicInfo.profilePhoto.url': cloudinaryResponse.url,
          'basicInfo.profilePhoto.publicId': cloudinaryResponse.public_id,
          'location.state': state,
          'location.city': city,
          'location.address': address,
          'location.serviceRadiusKm': serviceRadiusKm,
          'location.location': location,
        },
        { new: true }
      );

      if (!technicianRecord) {
        throw new Error('Technician not found');
      }

      req.flash('success', 'Your basic info has been saved successfully');
      return res.redirect('/technician/service-info');
    } catch (error) {
      Logger.error(`Error in saveBasicInfoHandler: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/technician/basic-info');
    }
  }

  async saveServiceInfoHandler(req: Request, res: Response) {
    try {
      Logger.info(`Save service info request received with body: ${JSON.stringify(req.body)}`);

      const { services, experienceYears, languages, workingDays, startTime, endTime } = req.body;

      const sanitizedLanguages = languages.split(',');
      const sanitizedWorkingDays = workingDays.split(',');

      const technicianId = req.user?._id;

      const technicianRecord = await techniciansModel.findByIdAndUpdate(
        technicianId,
        {
          'services.services': services,
          'services.languages': sanitizedLanguages,
          'services.availability.workingDays': sanitizedWorkingDays,
          'services.availability.startTime': startTime,
          'services.availability.endTime': endTime,
          'services.experienceYears': experienceYears,
        },
        { new: true }
      );

      if (!technicianRecord) {
        throw new Error('Technician not found');
      }

      req.flash('success', 'Your service info has been saved successfully');
      return res.redirect('/technician/kyc');
    } catch (error) {
      Logger.error(`Error in saveBasicInfoHandler: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/technician/service-info');
    }
  }

  async saveKycHandler(req: Request, res: Response) {
    try {
      Logger.info(`Save kyc request received with body: ${JSON.stringify(req.body)}`);
      const technicianId = req.user?._id;

      const { aadhaarNumber, panNumber } = req.body;

      const files = req.files as { [key: string]: Express.Multer.File[] };

      if (!files?.aadhaarFrontImage || !files?.aadhaarBackImage || !files?.panCardImage) {
        throw new Error('Please upload all required KYC images');
      }

      const aadhaarFrontPath = files.aadhaarFrontImage[0]!.path;
      const aadhaarBackPath = files.aadhaarBackImage[0]!.path;
      const panPath = files.panCardImage[0]!.path;

      const [aadhaarFrontUpload, aadhaarBackUpload, panUpload] = await Promise.all([
        uploadOnCloudinary({ localFilePath: aadhaarFrontPath }),
        uploadOnCloudinary({ localFilePath: aadhaarBackPath }),
        uploadOnCloudinary({ localFilePath: panPath }),
      ]);

      await technicianKycModel.findOneAndUpdate(
        { technicianId },
        {
          aadhaarNumber,
          panNumber,
          aadhaarFrontImage: aadhaarFrontUpload,
          aadhaarBackImage: aadhaarBackUpload,
          panCardImage: panUpload,
        },
        { new: true, upsert: true }
      );

      req.flash('success', 'Your KYC has been saved successfully');
      return res.redirect('/technician/dashboard');
    } catch (error) {
      Logger.error(`Error in saveBasicInfoHandler: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/technician/kyc');
    }
  }

  async loginHandler(req: Request, res: Response) {
    try {
      Logger.info(`User Login route called with data: ${JSON.stringify(req.body)}`);

      const { phone } = req.body;
      const formattedPhone = formatPhoneNumber(phone);

      const technicianRecord = await techniciansModel.findOne({
        'basicInfo.phone': formattedPhone,
        isPhoneVerified: true,
      });

      if (!technicianRecord) {
        throw new Error('Invalid Phone Number');
      }

      if (technicianRecord.isBlocked) {
        throw new Error('Your account is not active');
      }

      const signRandomOtp = authHelper.generateRandomOtp();
      if (!signRandomOtp) {
        throw new Error('Failed to generate verification code');
      }

      const hashedOtp = await authHelper.hashOtp(signRandomOtp?.toString());
      if (!hashedOtp) {
        throw new Error('Failed to hash verification code');
      }

      req.session.technicianDetails = {
        _id: technicianRecord._id,
        phone: phone,
      };

      await verificationModel.create({
        userId: technicianRecord._id,
        verificationCode: hashedOtp,
        verificationType: VerificationType.LOGIN,
        verificationCodeExpiration: new Date(Date.now() + VERIFICATION_CODE_EXPIRES_IN),
      });

      await sendSMS({
        body: `Your verification OTP is ${signRandomOtp}. It expires in 2 minutes.`,
        to: technicianRecord?.basicInfo?.phone,
      });

      req.flash(
        'success',
        `Your verification code has been sent to ${formattedPhone}. Please enter it to complete registration.`
      );
      return res.redirect('/technician/verify-phone');
    } catch (error) {
      Logger.error(`Error in loginHandler: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/technician/login');
    }
  }

  async logoutHandler(req: Request, res: Response) {
    try {
      Logger.info(`User logout route called with data: ${JSON.stringify(req.body)}`);

      const technicianId = req?.user?._id;
      await refreshTokenModel.deleteMany({ userId: technicianId });

      req.flash('success', 'Logged out successfully');

      //Clear cookies
      return res
        .clearCookie('refreshToken')
        .clearCookie('accessToken')
        .redirect('/technician/login');
    } catch (error) {
      Logger.error(`Error in logoutHandler: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/technician/login');
    }
  }
}

export default new TechniciansController();
