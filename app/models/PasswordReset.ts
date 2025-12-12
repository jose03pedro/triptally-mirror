import mongoose, { Schema, Document } from "mongoose";

export interface IPasswordReset extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const PasswordResetSchema = new Schema<IPasswordReset>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Auto-delete after 1 hour
  },
});

const PasswordReset =
  mongoose.models.PasswordReset ||
  mongoose.model<IPasswordReset>("PasswordReset", PasswordResetSchema);

export default PasswordReset;