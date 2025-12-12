import mongoose, { Schema, Document } from "mongoose";

export interface NotificationTypeDocument extends Document {
  name: string;
  icon: string;
}

const NotificationTypeSchema = new Schema<NotificationTypeDocument>({
  name: { type: String, required: true, unique: true },
  icon: { type: String, required: true },
});

const NotificationType =
  mongoose.models.NotificationType ||
  mongoose.model<NotificationTypeDocument>(
    "NotificationType",
    NotificationTypeSchema
  );

export default NotificationType;
