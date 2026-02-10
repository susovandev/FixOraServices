import { type Document, type Types, Schema, model } from 'mongoose';

export enum BookingStatus {
  CREATED = 'CREATED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
export interface IBookingDocument extends Document {
  bookingCode: string;
  customerId: Types.ObjectId;
  serviceId: Types.ObjectId;
  pricingSnapshot: {
    basePrice: number;
    commissionPercent: number;
  };
  address: {
    line1: string;
    city: string;
    pincode: string;
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  scheduledAt: Date;
  status: BookingStatus;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBookingDocument>(
  {
    bookingCode: { type: String, required: true },
    customerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    serviceId: { type: Schema.Types.ObjectId, required: true, ref: 'Service' },
    pricingSnapshot: {
      basePrice: { type: Number, required: true },
      commissionPercent: { type: Number, required: true },
    },
    address: {
      line1: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true },
      },
    },
    scheduledAt: { type: Date, required: true },
    status: { type: String, enum: Object.values(BookingStatus), required: true },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

export default model<IBookingDocument>('Booking', bookingSchema);
