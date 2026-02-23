import { type Document, type Types, Schema, model } from 'mongoose';

export interface IReviewDocument extends Document {
  _id: Types.ObjectId;
  bookingId: Types.ObjectId;
  customerId: Types.ObjectId;
  technicianId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReviewDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, required: true, ref: 'Booking' },
    customerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    technicianId: { type: Schema.Types.ObjectId, required: true, ref: 'Technician' },
    rating: { type: Number, required: true },
    comment: { type: String },
  },
  { timestamps: true }
);

export default model<IReviewDocument>('Review', reviewSchema);
