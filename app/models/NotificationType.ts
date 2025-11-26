import mongoose, { Schema, Document } from "mongoose";

export interface NotificationTypeDocument extends Document {
  type: string;
  icon: string;
}

const NotificationTypeSchema = new Schema<NotificationTypeDocument>({
  type: { type: String, required: true },
  icon: { type: String, required: true },
});

const NotificationType =
  mongoose.models.NotificationType ||
  mongoose.model<NotificationTypeDocument>(
    "NotificationType",
    NotificationTypeSchema
  );

export default NotificationType;
