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

const mustVisitLocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["restaurant", "attraction", "museum", "hotel", "shopping", "nightlife", "custom"],
      default: "custom",
    },
    address: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    placeId: { type: String }, // Google Places ID for fetching updates
    notes: { type: String },
    priority: {
      type: Number,
      enum: [1, 2, 3], // 1 = must-see, 2 = want to see, 3 = if time
      default: 2,
    },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
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
      lat: { type: Number },
      lon: { type: Number },
    },
  ],
  // Owner of the trip
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // Whether the trip is discoverable by other users
  isPublic: { type: Boolean, required: true, default: false },
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

  //! Must-visit locations for the trip
  mustVisitLocations: [mustVisitLocationSchema],

  participants: [participantSchema],
  // Fine‑grained privacy controls for what gets exposed publicly
  privacy: {
    type: privacySchema,
    default: {},
  },
  // Public sharing slug for US306
  publicSlug: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  // Current active plan for US311
  currentPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
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
