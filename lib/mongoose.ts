import "@/app/models/User";
import "@/app/models/Notification";
import "@/app/models/NotificationType";
import "@/app/models/Trip";
import "@/app/models/Currency";
import "@/app/models/Expense";
import "@/app/models/ExpenseCategory";
import "@/app/models/Flight";

import mongoose from "mongoose";

export default async function connectionToDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL!);
    console.log("Connected to db");
  } catch (error) {
    console.log("MongoDB connection error:", error);
  }
}
