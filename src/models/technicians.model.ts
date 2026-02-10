/*
{
  _id,
  name,
  phone,
  email?,
  profileImage,
  kyc: {
    idType,
    idNumber,
    documents: [url],
    verified: boolean
  },
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED',
  serviceRadiusKm,
  location: {
    type: 'Point',
    coordinates: [lng, lat]
  },
  rating: {
    avg,
    count
  },
  availability: {
    online: boolean,
    workingHours
  },
  createdAt,
  updatedAt
}
*/

import { Schema, type Document, model } from 'mongoose';

export enum TechnicianStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SUSPENDED = 'SUSPENDED',
}

export interface ITechnicianDocument extends Document {
  name: string;
  phone: string;
  email?: string;
  profileImage: string;
  kyc: {
    idType: string;
    idNumber: string;
    documents: string[];
    verified: boolean;
  };
  status: TechnicianStatus;
  serviceRadiusKm: number;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  rating: {
    avg: number;
    count: number;
  };
  availability: {
    online: boolean;
    workingHours: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const technicianSchema = new Schema<ITechnicianDocument>(
  {
    name: { type: String, trim: true },
    phone: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
    profileImage: { type: String, required: true },
    kyc: {
      idType: { type: String, required: true },
      idNumber: { type: String, required: true },
      documents: { type: [String], required: true },
      verified: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: Object.values(TechnicianStatus),
      default: TechnicianStatus.PENDING,
    },
    serviceRadiusKm: { type: Number, required: true },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true },
    },
    rating: {
      avg: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    availability: {
      online: { type: Boolean, default: false },
      workingHours: { type: [String], required: true },
    },
  },
  { timestamps: true, versionKey: false }
);

technicianSchema.index({ location: '2dsphere' });

export default model<ITechnicianDocument>('Technician', technicianSchema);
