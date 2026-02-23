import type { Document, Types } from 'mongoose';
import { Schema, model } from 'mongoose';

export enum ITechnicianKYCVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}
export interface ITechnicianKYCDocument extends Document {
  technicianId: Types.ObjectId;
  aadhaarNumber: string;
  panNumber: string;
  aadhaarFrontImage: string;
  aadhaarBackImage: string;
  panCardImage?: string;
  kycStatus: ITechnicianKYCVerificationStatus;
}

const technicianKYCSchema = new Schema<ITechnicianKYCDocument>(
  {
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: 'Technician',
      required: true,
      unique: true,
    },
    aadhaarNumber: {
      type: String,
      required: true,
      match: [/^\d{12}$/, 'Invalid Aadhaar'],
      unique: true,
    },
    panNumber: {
      type: String,
      required: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN'],
      unique: true,
    },
    aadhaarFrontImage: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    aadhaarBackImage: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    panCardImage: {
      url: { type: String },
      public_id: { type: String },
    },
    kycStatus: {
      type: String,
      enum: Object.values(ITechnicianKYCVerificationStatus),
      default: ITechnicianKYCVerificationStatus.PENDING,
    },
  },
  { timestamps: true }
);

technicianKYCSchema.index({ technicianId: 1 });

export default model<ITechnicianKYCDocument>('TechnicianKYC', technicianKYCSchema);
