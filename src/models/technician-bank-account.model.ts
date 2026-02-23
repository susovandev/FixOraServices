import { Schema, model, type Document, type Types } from 'mongoose';

export enum ITechnicianBankAccountVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}
export interface ITechnicianBackAccountDocument extends Document {
  technicianId: Types.ObjectId;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  bankStatus: ITechnicianBankAccountVerificationStatus;
}

const technicianBankAccountSchema = new Schema<ITechnicianBackAccountDocument>(
  {
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: 'Technician',
      required: true,
      unique: true,
    },

    accountNumber: {
      type: String,
      required: true,
      unique: true,
      minlength: 8,
      maxlength: 18,
    },

    ifscCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'],
    },

    bankName: {
      type: String,
      required: true,
      trim: true,
    },

    bankStatus: {
      type: String,
      enum: Object.values(ITechnicianBankAccountVerificationStatus),
      default: ITechnicianBankAccountVerificationStatus.PENDING,
    },
  },
  { timestamps: true }
);

export default model<ITechnicianBackAccountDocument>(
  'TechnicianBankAccount',
  technicianBankAccountSchema
);
