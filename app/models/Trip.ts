import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["owner", "editor", "viewer"],
      default: "owner",
    },
  },
  { _id: false }
);

const privacySchema = new mongoose.Schema(
  {
    showCities: { type: Boolean, default: true },
    showExpenses: { type: Boolean, default: true },
    showItinerary: { type: Boolean, default: true },
    showCover: { type: Boolean, default: true },
  },
  { _id: false }
);

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
  // Owner of the trip
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // Whether the trip is discoverable by other users
  isPublic: { type: Boolean, required: true, default: true },
  // Optional Base64 cover image
  coverImage: { type: String, required: false },
  // Simple collaborative structure for future expansion
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  // Currency of the trip
  currency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Currency",
    required: true,
  },
  // Weather snapshot of the trip
  lastWeatherSnapshot: {
      type: Array,
      default: []
  },
  //! Flights associated with the trip
  flights: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Flight"
   }],

  participants: [participantSchema],
  // Fine‑grained privacy controls for what gets exposed publicly
  privacy: {
    type: privacySchema,
    default: {},
  },
});

// Ensure the owner is always present in participants as "owner"
tripSchema.pre("save", function (next) {
  const trip: any = this;

  if (!trip.user) return next();

  if (!Array.isArray(trip.participants)) {
    trip.participants = [];
  }

  const ownerId = trip.user.toString();
  const hasOwner = trip.participants.some(
    (p: any) => p.user && p.user.toString() === ownerId && p.role === "owner"
  );

  if (!hasOwner) {
    trip.participants.push({ user: trip.user, role: "owner" });
  }

  next();
});

const Trip = mongoose.models?.Trip || mongoose.model("Trip", tripSchema);

export default Trip;
