/* eslint-disable @typescript-eslint/consistent-type-imports */
import mongoose, { Schema, model, type Document } from 'mongoose';

export enum VerificationType {
  PHONE_VERIFICATION = 'PHONE_VERIFICATION',
  PHONE_NUMBER_CHANGE = 'PHONE_NUMBER_CHANGE',
}
export enum VerificationStatus {
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
  COMPLETED = 'COMPLETED',
}
export interface IVerificationCodeDocument extends Document {
  userId: mongoose.Types.ObjectId;
  verificationCode: string;
  verificationCodeExpiration: Date;
  verificationType: VerificationType;
  verificationStatus: VerificationStatus;
  verifyAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const verificationSchema = new Schema<IVerificationCodeDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    verificationCode: { type: String, required: true },
    verificationCodeExpiration: { type: Date, required: true },
    verificationType: { type: String, required: true, enum: Object.values(VerificationType) },
    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.PENDING,
    },
  },
  { timestamps: true }
);

verificationSchema.index({ userId: 1, verificationType: 1 }, { unique: true });
verificationSchema.index({ verificationCodeExpiration: 1 }, { expireAfterSeconds: 0 });

export default model<IVerificationCodeDocument>('VerificationCode', verificationSchema);
