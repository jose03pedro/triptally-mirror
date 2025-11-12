import mongoose, { Schema, models } from "mongoose";

const expenseSchema = new Schema({
    description: { type: String, required: true },
    value: { type: Number, required: true },
    date: { type: Date, required: true },
    trip: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
    category: { type: Schema.Types.ObjectId, ref: "ExpenseCategory", required: true },
    currency: { type: Schema.Types.ObjectId, ref: "Currency", required: true },
});

const Expense = models?.Expense || mongoose.model("Expense", expenseSchema);
export default Expense;
