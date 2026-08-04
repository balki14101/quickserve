import { Schema, model, Document, Types } from "mongoose";

export type BookingStatus = "confirmed" | "cancelled" | "completed";

export interface IBooking extends Document {
  _id: Types.ObjectId;
  customerId: Types.ObjectId;
  providerId: Types.ObjectId;
  serviceId: Types.ObjectId;
  slotId: Types.ObjectId;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    providerId: { type: Schema.Types.ObjectId, ref: "ProviderProfile", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    slotId: { type: Schema.Types.ObjectId, ref: "Availability", required: true },
    status: { type: String, enum: ["confirmed", "cancelled", "completed"], default: "confirmed" },
  },
  { timestamps: true }
);

export const Booking = model<IBooking>("Booking", bookingSchema);
