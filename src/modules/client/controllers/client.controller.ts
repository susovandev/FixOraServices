/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'node:crypto';
import Logger from '@config/logger.config.js';
import razorpayClient from '@config/razorpay.config.js';
import authHelper from '@modules/auth/auth.helper.js';
import {
  ACCESS_TOKEN_EXPIRATION_TIME,
  REFRESH_TOKEN_EXPIRATION_TIME,
  VERIFICATION_CODE_EXPIRES_IN,
} from 'constants/index.js';
import type { Request, Response } from 'express';
import sendSMS, { formatPhoneNumber } from 'helper/twilio.helper.js';
import cartModel from 'models/cart.model.js';
import couponModel from 'models/coupon.model.js';
import orderModel from 'models/order.model.js';
import refreshTokenModel from 'models/refresh-token.model.js';
import reviewModel from 'models/review.model.js';
import servicesModel from 'models/services.model.js';
import userModel from 'models/user.model.js';
import verificationModel, { VerificationType } from 'models/verification.model.js';
import mongoose from 'mongoose';
import paymentModel from 'models/payment.model.js';
class ClientController {
  async getIndexPage(req: Request, res: Response) {
    const user = req?.user;

    const [appliances, popularServices] = await Promise.all([
      await servicesModel.aggregate([
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
          $match: {
            'category.name': 'Appliances',
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            image: 1,
            instant: 1,
          },
        },
      ]),
      reviewModel.aggregate([
        {
          $lookup: {
            from: 'bookings',
            localField: 'bookingId',
            foreignField: '_id',
            as: 'booking',
          },
        },
        { $unwind: '$booking' },
        {
          $group: {
            _id: '$booking.serviceId',
            avgRating: { $avg: '$rating' },
            reviewCount: { $sum: 1 },
          },
        },
        {
          $addFields: {
            popularityScore: {
              $multiply: ['$avgRating', { $log10: { $add: ['$reviewCount', 1] } }],
            },
          },
        },
        { $sort: { popularityScore: -1 } },
        {
          $lookup: {
            from: 'services',
            localField: '_id',
            foreignField: '_id',
            as: 'service',
          },
        },
        { $unwind: '$service' },
        { $match: { 'service.isActive': true } },
        {
          $project: {
            _id: '$service._id',
            name: '$service.name',
            images: '$service.images',
            description: '$service.description',
            avgRating: { $round: ['$avgRating', 1] },
            reviewCount: 1,
            popularityScore: 1,
          },
        },
        {
          $match: {
            avgRating: { $gte: 3.5 },
          },
        },
        { $limit: 10 },
      ]),
    ]);

    return res.render('pages/index', {
      title: 'FixOraService',
      username: 'John Doe',
      user,
      appliances,
      popularServices,
    });
  }

  async getLoginPage(req: Request, res: Response) {
    return res.render('pages/user/login', {
      title: 'FixOra Login',
    });
  }

  async getAboutPage(req: Request, res: Response) {
    const user = req?.user;
    return res.render('pages/about', {
      title: 'FixOra About',
      user,
    });
  }

  async getCareerPage(req: Request, res: Response) {
    const user = req.user;
    return res.render('pages/career', {
      title: 'FixOra Career',
      user,
      jobs: [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          title: 'Frontend Developer',
          location: 'Remote',
          type: 'Full-time',
        },
        {
          _id: new mongoose.Types.ObjectId().toString(),
          title: 'Backend Developer',
          location: 'Remote',
          type: 'Full-time',
        },
        {
          _id: new mongoose.Types.ObjectId().toString(),
          title: 'Frontend Developer',
          location: 'Remote',
          type: 'Full-time',
        },
      ],
    });
  }

  async getCareerDetail(req: Request, res: Response) {
    const user = req?.user;
    const { id } = req.params;
    return res.render('pages/career-detail', {
      title: 'FixOra Career',
      user,
      job: {
        _id: id,
        title: 'Frontend Developer',
        location: 'Remote',
        type: 'Full-time',
      },
    });
  }

  async getTermsPage(req: Request, res: Response) {
    const user = req?.user;
    return res.render('pages/terms', {
      title: 'FixOra Terms',
      user,
    });
  }

  async getPrivacyPage(req: Request, res: Response) {
    const user = req?.user;
    return res.render('pages/privacy', {
      title: 'FixOra Privacy',
      user,
    });
  }

  async getContactPage(req: Request, res: Response) {
    const user = req?.user;
    return res.render('pages/contact', {
      title: 'FixOra Contact',
      user,
    });
  }

  async getCartPage(req: Request, res: Response) {
    const user = req?.user;
    const cart = await cartModel.findOne({ userId: user?._id }).populate('items.serviceId');

    return res.render('pages/cart', {
      title: 'FIxOra Cart',
      cartId: cart?._id,
      cartItems: cart?.items,
      subtotal: cart?.subtotal,
      serviceFee: cart?.discount,
      discount: cart?.discount,
      total: cart?.totalAmount,
      user,
    });
  }

  async getVerifyPhonePage(req: Request, res: Response) {
    return res.render('pages/user/verify-phone', {
      phone: req.session?.technicianDetails?.phone,
      title: 'Verify Phone',
    });
  }

  async loginHandler(req: Request, res: Response) {
    try {
      Logger.info(`User Login route called with data: ${JSON.stringify(req.body)}`);

      const { phone } = req.body;
      const formattedPhone = formatPhoneNumber(phone);

      const userRecord = await userModel.findOne({
        phone: formattedPhone,
        isAccountVerified: true,
      });

      if (!userRecord) {
        throw new Error('Invalid Phone Number');
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
        _id: userRecord._id,
        phone: phone,
      };

      await verificationModel.create({
        userId: userRecord._id,
        verificationCode: hashedOtp,
        verificationType: VerificationType.LOGIN,
        verificationCodeExpiration: new Date(Date.now() + VERIFICATION_CODE_EXPIRES_IN),
      });

      await sendSMS({
        body: `Your verification OTP is ${signRandomOtp}. It expires in 2 minutes.`,
        to: userRecord.phone,
      });

      req.flash(
        'success',
        `Your verification code has been sent to ${formattedPhone}. Please enter it to complete registration.`
      );
      return res.redirect('/verify-phone');
    } catch (error) {
      Logger.error(`Error in loginHandler: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/');
    }
  }

  async verifyOtpHandler(req: Request, res: Response) {
    try {
      Logger.info(`Verify otp request received with body: ${JSON.stringify(req.body)}`);

      const { phone, otp } = req.body;

      const formattedPhone = formatPhoneNumber(phone);
      const sanitizeOtp = String(otp.join('').trim());

      const userRecord = await userModel.findOne({
        phone: formattedPhone,
      });
      if (!userRecord) {
        throw new Error('Your account is not registered Please register first');
      }

      const verificationCodeRecord = await verificationModel.findOne({
        userId: userRecord._id,
        verificationType: VerificationType.LOGIN,
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
        _id: userRecord._id,
        phone: formattedPhone,
      };

      const tokens = authHelper.signAccessTokenAndRefreshToken(userRecord);
      if (!tokens) {
        throw new Error('Failed to generate tokens');
      }

      const { accessToken, refreshToken } = tokens;

      await refreshTokenModel.create({
        userId: userRecord._id,
        tokenHash: refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_TIME),
      });

      req.flash('success', 'Your account is verified successfully, Please fill your details');

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
        .redirect('/');
    } catch (error) {
      Logger.error(`Error in verifyOtpHandler: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/verify-phone');
    }
  }

  async resendOtpHandler(req: Request, res: Response) {
    const { phone } = req.body;

    try {
      const formattedPhone = formatPhoneNumber(phone);

      const userRecord = await userModel.findOne({
        phone: formattedPhone,
      });

      if (!userRecord) {
        throw new Error(
          'Your account is not eligible for OTP verification, please contact support'
        );
      }

      if (userRecord.isAccountVerified) {
        throw new Error('Your account is already verified please login');
      }

      const latestOtp = await verificationModel
        .findOne({
          userId: userRecord._id,
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
        userId: userRecord._id,
        verificationCode: hashedOtp,
        verificationType: VerificationType.REGISTER,
        verificationCodeExpiration: new Date(Date.now() + VERIFICATION_CODE_EXPIRES_IN),
      });

      await sendSMS({
        body: `Your OTP is ${otp}. It expires soon.`,
        to: userRecord.phone,
      });

      req.flash('success', 'A new OTP has been sent to your phone');
      return res.redirect('/');
    } catch (error) {
      Logger.error(`Error in userResendOTPHandler: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/');
    }
  }

  async logoutHandler(req: Request, res: Response) {
    try {
      Logger.info(`User logout route called with data: ${JSON.stringify(req.body)}`);

      const userId = req?.user?._id;
      await refreshTokenModel.deleteMany({ userId: userId });

      req.flash('success', 'Logged out successfully');

      //Clear cookies
      return res.clearCookie('refreshToken').clearCookie('accessToken').redirect('/');
    } catch (error) {
      Logger.error(`Error in logoutHandler: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/');
    }
  }

  async addToWishlistHandler(req: Request, res: Response) {
    try {
      const userId = req?.user?._id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { serviceId } = req.body;

      const service = await servicesModel.findById(serviceId).populate('pricingId');

      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }

      let cart = await cartModel.findOne({ userId });

      if (!cart) {
        cart = await cartModel.create({ userId, items: [] });
      }

      const index = cart.items.findIndex(i => i.serviceId.toString() === serviceId.toString());

      if (index > -1) {
        cart!.items[index]!.quantity += 1;
      } else {
        const pricing =
          typeof service.pricingId === 'object' && service.pricingId !== null
            ? service.pricingId
            : { basePrice: 0 };
        cart.items.push({
          serviceId,
          quantity: 1,
          name: service.name,
          price: (pricing as any).basePrice ?? 0,
          image: service!.images?.[0]?.url ?? '',
          selectedDate: null,
          selectedSlot: null,
          toObject: function () {
            return {
              serviceId: this.serviceId,
              quantity: this.quantity,
              name: this.name,
              price: this.price,
              image: this.image,
              selectedDate: this.selectedDate,
              selectedSlot: this.selectedSlot,
            };
          },
        });
      }

      await cart.save();

      res.json({ success: true });
    } catch (err) {
      Logger.error(`Error in addToWishlistHandler: ${err}`);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateCartHandler(req: Request, res: Response) {
    try {
      const userId = req?.user?._id;
      const { serviceId } = req.params;
      const { quantity } = req.body;

      const updateCart = await cartModel.findOneAndUpdate(
        { userId, 'items.serviceId': serviceId },
        { $set: { 'items.$.quantity': quantity } },
        { new: true }
      );

      if (!updateCart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      const totalAmount = updateCart.items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      updateCart.subtotal = totalAmount;
      updateCart.totalAmount = totalAmount;
      await updateCart.save();

      req.flash('success', 'Cart updated successfully');
      return res.redirect('/cart');
    } catch (error) {
      Logger.error(`Error in updateCart Controller: ${error}`);
      req.flash('error');
      return res.redirect('/cart');
    }
  }

  async removeFromCartHandler(req: Request, res: Response) {
    try {
      const userId = req?.user?._id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const { serviceId } = req.params;
      const updatedCart = await cartModel.findOneAndUpdate(
        { userId },
        {
          $pull: {
            items: { serviceId },
          },
        },
        { new: true }
      );

      if (!updatedCart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      const totalAmount = updatedCart.items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      updatedCart.subtotal = totalAmount;
      updatedCart.totalAmount = totalAmount;
      await updatedCart.save();

      return res.redirect('/cart');
    } catch (err) {
      Logger.error(`Error in removeFromCartHandler: ${err}`);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async applyCouponHandler(req: Request, res: Response) {
    try {
      const userId = req?.user?._id;
      const { coupon } = req.body;

      const cart = await cartModel.findOne({ userId }).populate('items.serviceId');

      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      const totalAmount = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

      const couponRecord = await couponModel.findOne({ code: coupon });
      if (!couponRecord) return res.status(404).json({ message: 'Coupon not found' });

      if (!couponRecord) {
        return res.status(404).json({ message: 'Coupon not found' });
      }

      const discount = (totalAmount * couponRecord.discountValue) / 100;

      cart.discount = discount;
      cart.totalAmount = totalAmount - discount;
      await cart.save();

      return res.redirect('/cart');
    } catch (error) {
      Logger.error(`Error in applyCouponHandler: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/cart');
    }
  }

  async createOrderHandler(req: Request, res: Response) {
    try {
      const userId = req?.user?._id;
      const { cartId } = req.body;
      const cart = await cartModel.findById(cartId).populate('items.serviceId');

      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      const totalAmount = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

      const discount = (totalAmount * cart.discount) / 100;

      const order = await orderModel.create({
        userId,
        items: cart.items.map(item => ({
          ...(item.toObject?.() || item),
          selectedDate: item.selectedDate ?? undefined,
        })),
        subtotal: totalAmount,
        discount,
        totalAmount,
        currency: 'INR',
        status: 'created',
      });

      // Create razorpay order
      const razorpayOrder = await razorpayClient.orders.create({
        amount: order.totalAmount * 100,
        currency: 'INR',
        receipt: order._id.toString(),
      });
      if (!razorpayOrder) throw new Error('Unable to create razorpay order');

      order.razorpayOrderId = razorpayOrder.id;
      await order.save();

      res.json({
        success: true,
        key: process.env.RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderId: razorpayOrder.id,
      });
    } catch (error) {
      Logger.error(`Error in createOrderHandler: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/cart');
    }
  }

  async verifyPayment(req: Request, res: Response) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_TEST_API_SECRET!)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.json({ success: false });
    }

    // Find order
    const order = await orderModel.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!order) return res.json({ success: false });

    // Save payment
    await paymentModel.create({
      orderId: order._id,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature,
      amount: order.totalAmount,
      currency: 'INR',
      status: 'captured',
    });

    // Update order
    order.status = 'paid';
    await order.save();

    // Clear cart
    await cartModel.deleteOne({ userId: order.userId });

    res.json({ success: true });
  }

  async paymentSuccessHandler(req: Request, res: Response) {
    const user = req?.user;
    return res.render('pages/payment-success', {
      title: 'Payment Success',
      user,
      orderId: 'ihodfhidhadgihgrh',
      paymentId: 'ihodfhidhadgihgrh',
      amount: 10000,
      serviceName: 'AC Repair',
      autoRedirect: false,
    });
  }
}

export default new ClientController();
