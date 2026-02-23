/* eslint-disable @typescript-eslint/no-explicit-any */
import { model, Schema, type Document, type Types } from 'mongoose';

export interface IItemShape {
  toObject(): any;
  serviceId: Types.ObjectId;
  quantity: number;
  name: string;
  price: number;
  image: string;
  selectedDate: Date | null;
  selectedSlot: string | null;
}
export interface ICart extends Document {
  userId: Types.ObjectId;
  items: IItemShape[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    items: [
      {
        serviceId: {
          type: Schema.Types.ObjectId,
          ref: 'Service',
          required: true,
        },

        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },

        name: String,
        price: Number,
        image: { type: String, default: '' },
        selectedDate: Date,
        selectedSlot: String,
      },
    ],

    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

cartSchema.pre('save', async function () {
  if (!this.isModified('items') && !this.isModified('discount')) return;

  const cart = this as ICart;

  cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);

  cart.totalAmount = Math.max(cart.subtotal - cart.discount, 0);
});

cartSchema.index({ userId: 1 });

export default model<ICart>('Cart', cartSchema);
