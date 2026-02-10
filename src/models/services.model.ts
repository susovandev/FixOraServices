import { type Document, type Types, Schema, model } from 'mongoose';

export interface IServiceDocument extends Document {
  categoryId: Types.ObjectId;
  name: string;
  description: string;
  baseDurationMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IServiceDocument>(
  {
    categoryId: { type: Schema.Types.ObjectId, required: true, ref: 'ServiceCategory' },
    name: { type: String, required: true },
    description: { type: String, required: true },
    baseDurationMinutes: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<IServiceDocument>('Service', serviceSchema);
