import mongoose, { Types } from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, trim: true },
  first_name: { type: String, required: true, trim: true },
  last_name: { type: String, required: true, trim: true },
  provider: { type: String, default: "local" }, // track auth method
  savedTrips: [
    {
      type: Types.ObjectId,
      ref: "Trip",
    },
  ],
  avatar: { type: String, required: false },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
