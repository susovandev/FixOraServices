import { Schema, model, type Document, type Types } from 'mongoose';

export enum CouponDiscountType {
  PERCENTAGE = 'percentage',
  FLAT = 'flat',
}

export interface ICouponDocument extends Document {
  code: string;
  description?: string;

  discountType: CouponDiscountType;
  discountValue: number;

  maxDiscountAmount?: number;
  minOrderAmount?: number;

  applicableServices?: Types.ObjectId[];
  applicableCategories?: Types.ObjectId[];

  usageLimit?: number;
  usedCount: number;

  perUserLimit?: number;

  validFrom: Date;
  validUntil: Date;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

/*
 */
const couponSchema = new Schema<ICouponDocument>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: String,

    discountType: {
      type: String,
      enum: Object.values(CouponDiscountType),
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
    },

    maxDiscountAmount: Number,

    minOrderAmount: Number,

    applicableServices: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Service',
      },
    ],

    applicableCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ServiceCategory',
      },
    ],

    usageLimit: Number,

    usedCount: {
      type: Number,
      default: 0,
    },

    perUserLimit: Number,

    validFrom: {
      type: Date,
      required: true,
    },

    validUntil: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default model<ICouponDocument>('Coupon', couponSchema);
