import { type Document, type Types, Schema, model } from 'mongoose';

export interface IServicePricingHistoryDocument extends Document {
  pricingId: Types.ObjectId;
  serviceId: Types.ObjectId;
  city: string;
  oldPrice: number;
  newPrice: number;
  oldCommission: number;
  newCommission: number;
  oldExtraChargesAllowed: boolean;
  newExtraChargesAllowed: boolean;
  changedBy: Types.ObjectId;
  changeReason: string;
  changedAt: Date;
}

const servicePricingHistorySchema = new Schema({
  pricingId: {
    type: Schema.Types.ObjectId,
    ref: 'ServicePricing',
    required: true,
  },

  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },

  city: { type: String, required: true },

  oldPrice: Number,
  newPrice: Number,

  oldCommission: Number,
  newCommission: Number,

  oldExtraChargesAllowed: Boolean,
  newExtraChargesAllowed: Boolean,

  changedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  changeReason: {
    type: String,
    default: 'Admin update',
  },

  changedAt: {
    type: Date,
    default: Date.now,
  },
});

export default model<IServicePricingHistoryDocument>(
  'ServicePricingHistory',
  servicePricingHistorySchema
);
