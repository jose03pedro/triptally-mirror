import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    cities: [
        {
            name: { type: String, required: true },
            country: { type: String, required: true },
        },
    ],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isPublic: { type: Boolean, default: true },
});

const Trip = mongoose.models?.Trip || mongoose.model("Trip", tripSchema);
export default Trip;
