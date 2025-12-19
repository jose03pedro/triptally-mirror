import mongoose, { Schema, Document, Types } from "mongoose";

export interface Activity {
  time: string; // e.g., "09:00", "14:30"
  title: string;
  location?: string;
  notes?: string;
  tags?: string[];
  estimatedDuration?: number; // in minutes
}

export interface PlanDay {
  date: string; // ISO date string
  activities: Activity[];
}

export interface PlanDocument extends Document {
  tripId: Types.ObjectId;
  version: number;
  status: "draft" | "accepted";
  generatedBy: "ai" | "user";
  days: PlanDay[];
  createdAt: Date;
  updatedAt: Date;
  parentPlanId?: Types.ObjectId; // Reference to previous plan version if recomputed
  reason?: string; // Reason for generation/recompute (e.g., "initial", "flight_delay", "weather")
}

const activitySchema = new Schema(
  {
    time: { type: String, required: true },
    title: { type: String, required: true },
    location: { type: String },
    notes: { type: String },
    tags: [{ type: String }],
    estimatedDuration: { type: Number },
  },
  { _id: false }
);

const planDaySchema = new Schema(
  {
    date: { type: String, required: true },
    activities: [activitySchema],
  },
  { _id: false }
);

const planSchema = new Schema<PlanDocument>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    status: {
      type: String,
      enum: ["draft", "accepted"],
      default: "draft",
      index: true,
    },
    generatedBy: {
      type: String,
      enum: ["ai", "user"],
      default: "ai",
    },
    days: [planDaySchema],
    parentPlanId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
    },
    reason: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
planSchema.index({ tripId: 1, status: 1 });
planSchema.index({ tripId: 1, version: -1 });

const Plan =
  mongoose.models.Plan ||
  mongoose.model<PlanDocument>("Plan", planSchema);

export default Plan;

