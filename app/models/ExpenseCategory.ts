import mongoose, { Schema, models } from "mongoose";

const ExpenseCategorySchema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        color: { type: String, required: true },
        icon: { type: String },
    }
);

const ExpenseCategory =
    models.ExpenseCategory || mongoose.model("ExpenseCategory", ExpenseCategorySchema);

export default ExpenseCategory;
