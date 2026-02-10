import { type Document, type Types, Schema, model } from 'mongoose';

export interface IServicePricingDocument extends Document {
  serviceId: Types.ObjectId;
  city: string;
  basePrice: number;
  commissionPercent: number;
  extraChargesAllowed: boolean;
  lastUpdatedByAdmin: Types.ObjectId;
  updatedAt: Date;
}

const servicePricingSchema = new Schema<IServicePricingDocument>(
  {
    serviceId: { type: Schema.Types.ObjectId, required: true, ref: 'Service' },
    city: { type: String, required: true },
    basePrice: { type: Number, required: true },
    commissionPercent: { type: Number, required: true },
    extraChargesAllowed: { type: Boolean, required: true },
    lastUpdatedByAdmin: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true }
);

export default model<IServicePricingDocument>('ServicePricing', servicePricingSchema);
