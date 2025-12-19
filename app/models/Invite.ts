import mongoose, { Schema, Document, Types } from "mongoose";

export interface InviteDocument extends Document {
  tripId: Types.ObjectId;
  invitedEmail?: string;
  invitedUserId?: Types.ObjectId;
  token: string;
  status: "pending" | "accepted" | "revoked";
  createdAt: Date;
  expiresAt: Date;
  invitedBy: Types.ObjectId;
}

const InviteSchema = new Schema<InviteDocument>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    invitedEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    invitedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "revoked"],
      default: "pending",
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
InviteSchema.index({ tripId: 1, status: 1 });
InviteSchema.index({ token: 1, status: 1 });

const Invite =
  mongoose.models.Invite ||
  mongoose.model<InviteDocument>("Invite", InviteSchema);

export default Invite;

