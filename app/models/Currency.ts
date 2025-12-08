import mongoose, { Schema, models } from "mongoose";

const CurrencySchema = new Schema(
    {
        code: { type: String, length: 3, required: true, unique: true },
        name: { type: String, required: true, unique: true },
        symbol: { type: String, required: true },
    }
);

const Currency =
    models.Currency || mongoose.model("Currency", CurrencySchema);

export default Currency;
