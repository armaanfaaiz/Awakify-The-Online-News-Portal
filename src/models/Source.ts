import mongoose, { Schema, models, model } from "mongoose";

export interface ISource {
  name: string;
  domain: string;
  credibilityScore: number;
}

const SourceSchema = new Schema<ISource>(
  {
    name: { type: String, required: true },
    domain: { type: String, required: true, unique: true, index: true },
    credibilityScore: { type: Number, default: 60, min: 0, max: 100 },
  },
  { timestamps: true }
);

export const Source = models.Source || model<ISource>("Source", SourceSchema);
