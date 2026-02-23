import { Schema, model, type Document, type Types } from 'mongoose';

export interface IOrderItem {
  serviceId: Types.ObjectId;
  quantity: number;
  name: string;
  price: number;
  image: string;
  selectedDate: Date;
  selectedSlot: string;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  currency: 'INR';
  razorpayOrderId?: string;
  status: 'created' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    items: [
      {
        serviceId: {
          type: Schema.Types.ObjectId,
          ref: 'Service',
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        name: String,
        price: Number,
        image: String,
        selectedDate: Date,
        selectedSlot: String,
      },
    ],

    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    currency: {
      type: String,
      enum: ['INR'],
      default: 'INR',
      required: true,
    },

    razorpayOrderId: {
      type: String,
      index: true,
    },

    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'cancelled', 'refunded'],
      default: 'created',
    },
  },
  { timestamps: true }
);

export default model<IOrder>('Order', orderSchema);
