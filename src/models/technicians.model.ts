import type { Document, Types } from 'mongoose';
import { Schema, model } from 'mongoose';

export interface IImageShape {
  publicId: string;
  url: string;
}

export enum TechnicianVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum TechnicianWorkingDays {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export interface ITechnicianBasicInfoDocument {
  fullName: string;
  phone: string;
  email?: string;
  profilePhoto: IImageShape;
}

export interface ITechnicianLocationDocument {
  state: Types.ObjectId;
  city: Types.ObjectId;
  address: {
    line1: string;
    area: string;
    pincode: string;
  };
  location: {
    type: string;
    coordinates: [number, number];
  };
  serviceRadiusKm: number;
}

export interface ITechnicianServicesDocument {
  services: Types.ObjectId[];
  experienceYears: number;
  languages: string[];
  availability: {
    workingDays: TechnicianWorkingDays[];
    startTime: string;
    endTime: string;
  };
}

export interface ITechnicianDocument extends Document {
  basicInfo: ITechnicianBasicInfoDocument;
  location: ITechnicianLocationDocument;
  services: ITechnicianServicesDocument;
  rating: number;
  totalJobsCompleted: number;
  totalEarnings: number;
  technicianVerificationStatus: TechnicianVerificationStatus;
  isPhoneVerified: boolean;
  isActive: boolean;
  isBlocked: boolean;
}

const imageSchema = new Schema<IImageShape>(
  {
    publicId: String,
    url: String,
  },
  { _id: false }
);

const technicianBasicInfoSchema = new Schema<ITechnicianBasicInfoDocument>(
  {
    fullName: {
      type: String,
    },
    phone: { type: String },
    email: { type: String, unique: true, sparse: true },
    profilePhoto: {
      type: imageSchema,
    },
  },
  { versionKey: false, _id: false }
);

const technicianLocationSchema = new Schema<ITechnicianLocationDocument>(
  {
    state: {
      type: Schema.Types.ObjectId,
      ref: 'State',
      index: true,
    },

    city: {
      type: Schema.Types.ObjectId,
      ref: 'City',
      index: true,
    },

    address: {
      line1: String,
      area: String,
      pincode: String,
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: (v: number[]) => v.length === 2,
          message: 'Coordinates must be [lng, lat]',
        },
      },
    },
    serviceRadiusKm: { type: Number, default: 10 },
  },
  {
    versionKey: false,
    _id: false,
  }
);

const technicianServicesSchema = new Schema<ITechnicianServicesDocument>(
  {
    services: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        index: true,
      },
    ],
    experienceYears: { type: Number, min: 0 },
    languages: [{ type: String }],
    availability: {
      workingDays: [
        {
          type: String,
          enum: Object.values(TechnicianWorkingDays),
        },
      ],
      startTime: String,
      endTime: String,
    },
  },
  {
    versionKey: false,
    _id: false,
  }
);

const technicianSchema = new Schema<ITechnicianDocument>(
  {
    basicInfo: technicianBasicInfoSchema,
    location: technicianLocationSchema,
    services: technicianServicesSchema,
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalJobsCompleted: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0, min: 0 },
    technicianVerificationStatus: {
      type: String,
      enum: Object.values(TechnicianVerificationStatus),
      default: TechnicianVerificationStatus.PENDING,
    },
    isPhoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

technicianSchema.index({ 'location.location': '2dsphere' });
technicianSchema.index({ 'basicInfo.phone': 1 }, { unique: true });

export default model<ITechnicianDocument>('Technician', technicianSchema);
