import { Schema, model, type Document, type Types } from 'mongoose';

export interface IRefreshTokenDocument extends Document {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  isRevoked: boolean;
  ip: string;
  userAgent: string;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshTokenDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    tokenHash: {
      type: String,
      required: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    isRevoked: {
      type: Boolean,
      default: false,
    },

    ip: { type: String },
    userAgent: { type: String },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

refreshTokenSchema.index({ userId: 1, isRevoked: 1 });
refreshTokenSchema.index({ expiresAt: 1 });

export default model<IRefreshTokenDocument>('RefreshToken', refreshTokenSchema);
