import { type Document, type Types, Schema, model } from 'mongoose';

export interface ITechnicianServicesDocument extends Document {
  technicianId: Types.ObjectId;
  serviceId: Types.ObjectId;
  experienceYears: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const technicianServicesSchema = new Schema<ITechnicianServicesDocument>(
  {
    technicianId: { type: Schema.Types.ObjectId, required: true, ref: 'Technician' },
    serviceId: { type: Schema.Types.ObjectId, required: true, ref: 'Service' },
    experienceYears: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<ITechnicianServicesDocument>('TechnicianServices', technicianServicesSchema);
