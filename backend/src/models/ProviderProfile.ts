import { Schema, model, Document, Types } from "mongoose";

export interface IProviderProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  businessName: string;
  category: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const providerProfileSchema = new Schema<IProviderProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    businessName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export const ProviderProfile = model<IProviderProfile>("ProviderProfile", providerProfileSchema);
