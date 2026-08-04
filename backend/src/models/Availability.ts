import { Schema, model, Document, Types } from "mongoose";

export interface IAvailability extends Document {
  _id: Types.ObjectId;
  providerId: Types.ObjectId;
  serviceId: Types.ObjectId;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const availabilitySchema = new Schema<IAvailability>(
  {
    providerId: { type: Schema.Types.ObjectId, ref: "ProviderProfile", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Availability = model<IAvailability>("Availability", availabilitySchema);
