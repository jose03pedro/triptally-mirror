import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, trim: true },
  first_name: { type: String, required: true, trim: true },
  last_name: { type: String, required: true, trim: true },
  provider: { type: String, default: "local" }, // track auth method
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
