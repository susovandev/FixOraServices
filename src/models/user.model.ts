import { Schema, type Document, model } from 'mongoose';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  PENDING = 'PENDING',
}
export interface IUserDocument extends Document {
  name: string;
  email?: string;
  passwordHash?: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  isAccountVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    passwordHash: { type: String },
    phone: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.CUSTOMER },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.PENDING },
    isAccountVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

export default model<IUserDocument>('User', userSchema);
