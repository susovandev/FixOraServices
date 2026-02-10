import { type Document, model, Schema } from 'mongoose';
export interface IServiceCategoryDocument extends Document {
  name: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
}

const serviceCategorySchema = new Schema<IServiceCategoryDocument>(
  {
    name: { type: String, required: true },
    icon: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<IServiceCategoryDocument>('ServiceCategory', serviceCategorySchema);
