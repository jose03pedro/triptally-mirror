import mongoose, { Schema, Document, Types } from "mongoose";

export interface NotificationDocument extends Document {
  user: Types.ObjectId; // The user who receives the notification
  type: Types.ObjectId;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: Schema.Types.ObjectId,
      ref: "NotificationType",
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification =
  mongoose.models.Notification ||
  mongoose.model<NotificationDocument>("Notification", NotificationSchema);

export default Notification;
