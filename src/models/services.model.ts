import { type Document, type Types, Schema, model } from 'mongoose';

export interface IFileShape {
  publicId: string;
  url: string;
}
export interface IServiceDocument extends Document {
  categoryId: Types.ObjectId;
  pricingId: Types.ObjectId;
  name: string;
  description: string;
  images: IFileShape[];
  baseDurationMinutes: number;
  isActive: boolean;
  instant: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IServiceDocument>(
  {
    categoryId: { type: Schema.Types.ObjectId, required: true, ref: 'ServiceCategory' },
    pricingId: { type: Schema.Types.ObjectId, required: true, ref: 'ServicePricing' },
    name: { type: String, required: true },
    images: [
      {
        publicId: String,
        url: String,
      },
    ],
    description: { type: String, required: true },
    baseDurationMinutes: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    instant: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<IServiceDocument>('Service', serviceSchema);
