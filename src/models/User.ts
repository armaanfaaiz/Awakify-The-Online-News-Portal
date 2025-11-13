import mongoose, { Schema, models, model } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  roles: string[];
  subscription: {
    plan: "free" | "pro" | "enterprise";
    status: "active" | "expired" | "canceled";
    expiresAt?: Date | null;
    canceledAt?: Date | null;
  };
  preferences?: {
    categories?: string[];
    regions?: string[];
    sources?: string[];
    language?: string;
  };
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    roles: { type: [String], default: ["user"], index: true },
    subscription: {
      plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
      status: { type: String, enum: ["active", "expired", "canceled"], default: "active" },
      expiresAt: { type: Date, default: null },
      canceledAt: { type: Date, default: null },
    },
    preferences: {
      categories: { type: [String], default: [] },
      regions: { type: [String], default: [] },
      sources: { type: [String], default: [] },
      language: { type: String, default: "en" },
    },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);
