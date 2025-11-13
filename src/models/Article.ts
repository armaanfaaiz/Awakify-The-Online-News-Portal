import mongoose, { Schema, models, model } from "mongoose";

export interface IArticle {
  title: string;
  url: string;
  sourceName: string;
  sourceDomain: string;
  image?: string | null;
  publishedAt?: Date | null;
  summary?: string;
  content?: string;
  categories: string[];
  language?: string;
  region?: string;
  fingerprint: string;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    sourceName: { type: String, required: true, index: true },
    sourceDomain: { type: String, required: true, index: true },
    image: { type: String, default: null },
    publishedAt: { type: Date, default: null, index: true },
    summary: { type: String, default: "" },
    content: { type: String, default: "" },
    categories: { type: [String], default: [], index: true },
    language: { type: String, default: "en", index: true },
    region: { type: String, default: "" },
    fingerprint: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

export const Article = models.Article || model<IArticle>("Article", ArticleSchema);
