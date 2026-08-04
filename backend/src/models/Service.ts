import { Schema, model, Document, Types } from "mongoose";

export interface IService extends Document {
  _id: Types.ObjectId;
  providerId: Types.ObjectId;
  name: string;
  durationMinutes: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    providerId: { type: Schema.Types.ObjectId, ref: "ProviderProfile", required: true },
    name: { type: String, required: true, trim: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const Service = model<IService>("Service", serviceSchema);
