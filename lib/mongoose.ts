import mongoose from "mongoose";

export default async function connectionToDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL!);
    console.log("Connected to db");
  } catch (error) {
    console.log("MongoDB connection error:", error);
  }
}
