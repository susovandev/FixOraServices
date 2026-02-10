import { type Document, type Types, Schema, model } from 'mongoose';
export interface IWalletDocument extends Document {
  ownerId: Types.ObjectId;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWalletDocument>(
  {
    ownerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    balance: { type: Number, required: true },
  },
  { timestamps: true }
);

export default model<IWalletDocument>('Wallet', walletSchema);
