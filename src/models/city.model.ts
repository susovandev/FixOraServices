import { type Document, Schema, model, type Types } from 'mongoose';

export interface ICityDocument extends Document {
  name: string;
  state: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const citySchema = new Schema<ICityDocument>(
  {
    name: { type: String, required: true },
    state: { type: Schema.Types.ObjectId, required: true, ref: 'State' },
  },
  { timestamps: true }
);

export default model<ICityDocument>('City', citySchema);
