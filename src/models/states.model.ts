import { Schema, model, type Document, type Types } from 'mongoose';

export interface IStateDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const stateSchema = new Schema<IStateDocument>(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export default model<IStateDocument>('State', stateSchema);
