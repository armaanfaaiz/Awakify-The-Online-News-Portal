import mongoose, { Schema, models, model, Types } from "mongoose";

export type EventType = "view" | "click";

export interface IEvent {
  userId?: Types.ObjectId | null;
  articleId: Types.ObjectId;
  type: EventType;
}

const EventSchema = new Schema<IEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    articleId: { type: Schema.Types.ObjectId, ref: "Article", required: true, index: true },
    type: { type: String, enum: ["view", "click"], required: true, index: true },
  },
  { timestamps: true }
);

export const Event = models.Event || model<IEvent>("Event", EventSchema);
