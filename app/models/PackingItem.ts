import mongoose, { Schema, Document, Types } from "mongoose";

export type PackingItemSource = "base" | "weather" | "profile";

export interface PackingItemDocument extends Document {
  trip: Types.ObjectId;
  name: string;
  category: string;
  required: boolean;
  checked: boolean;
  quantity?: number;
  source: PackingItemSource;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PackingItemSchema = new Schema<PackingItemDocument>(
  {
    trip: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    category: { type: String, required: true },
    required: { type: Boolean, default: false },
    checked: { type: Boolean, default: false },
    quantity: { type: Number, default: 1 },
    source: {
      type: String,
      enum: ["base", "weather", "profile"],
      default: "base",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

const PackingItem =
  mongoose.models.PackingItem ||
  mongoose.model<PackingItemDocument>("PackingItem", PackingItemSchema);

export default PackingItem;
