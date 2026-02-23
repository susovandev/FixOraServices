import { type Document, type Types, Schema, model } from 'mongoose';

export enum BookingAssignmentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  ASSIGNED = 'assigned',
}
export interface IBookingAssignmentDocument extends Document {
  _id: Types.ObjectId;
  bookingId: Types.ObjectId;
  technicianId: Types.ObjectId;
  assignedAt: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  status: BookingAssignmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const bookingAssignmentSchema = new Schema<IBookingAssignmentDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, required: true, ref: 'Booking' },
    technicianId: { type: Schema.Types.ObjectId, required: true, ref: 'Technician' },
    assignedAt: { type: Date, required: true },
    acceptedAt: { type: Date },
    rejectedAt: { type: Date },
    status: { type: String, enum: Object.values(BookingAssignmentStatus), required: true },
  },
  { timestamps: true }
);

export default model<IBookingAssignmentDocument>('BookingAssignment', bookingAssignmentSchema);
