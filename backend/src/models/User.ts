import { Schema, model, Document, Types } from "mongoose";

export type UserRole = "customer" | "provider";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["customer", "provider"], required: true },
    phone: { type: String, required: true },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
