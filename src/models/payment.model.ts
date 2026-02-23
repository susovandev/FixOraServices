import { Schema, model, type Document, type Types } from 'mongoose';

export interface IPayment extends Document {
  orderId: Types.ObjectId;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
  amount: number;
  currency: 'INR';
  status: 'captured' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      required: true,
      unique: true,
    },

    razorpayOrderId: {
      type: String,
      required: true,
    },

    razorpaySignature: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      enum: ['INR'],
      default: 'INR',
      required: true,
    },

    status: {
      type: String,
      enum: ['captured', 'failed'],
      default: 'captured',
    },
  },
  { timestamps: true }
);

export default model<IPayment>('Payment', paymentSchema);
