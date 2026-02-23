import { Schema, model, type Document, type Types } from 'mongoose';

export enum VerificationType {
  REGISTER = 'REGISTER',
  LOGIN = 'LOGIN',
  CHANGE_NUMBER = 'CHANGE_NUMBER',
}
export interface IVerificationCodeDocument extends Document {
  userId: Types.ObjectId;
  verificationCode: string;
  verificationType: VerificationType;
  verificationCodeExpiration: Date;
  createdAt: Date;
  updatedAt: Date;
}

const verificationSchema = new Schema<IVerificationCodeDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    verificationType: { type: String, enum: Object.values(VerificationType), required: true },
    verificationCode: { type: String, required: true },
    verificationCodeExpiration: { type: Date, required: true },
  },
  { timestamps: true }
);

verificationSchema.index({ verificationCodeExpiration: 1 }, { expireAfterSeconds: 0 });

export default model<IVerificationCodeDocument>('VerificationCode', verificationSchema);
