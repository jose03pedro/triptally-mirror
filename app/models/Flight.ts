import mongoose, { Schema } from "mongoose";

const FlightSchema = new Schema(
  {
    date: { type: Date, required: true },
    flightNumber: String,
    // tripId: { type: Schema.Types.ObjectId, ref: "Trip" },

    aircraft: {
      model: String,
    },

    airline: {
      name: String,
      iata: String,
      icao: String,
    },

    isCargo: Boolean,
    status: String,
    lastUpdated: Date,

    departure: {
      airport: {
        iata: String,
        icao: String,
        name: String,
        city: String,
        countryCode: String,
      },
      terminal: String,
      gate: String,
      scheduledTimeUtc: Date,
      scheduledTimeLocal: Date,
    },

    arrival: {
      airport: {
        iata: String,
        icao: String,
        name: String,
        city: String,
        countryCode: String,
      },
      scheduledTimeUtc: Date,
      scheduledTimeLocal: Date,
      actualTimeUtc: Date,
      actualTimeLocal: Date,
    },
  },
  { timestamps: true }
);


const Flight = mongoose.models?.Flight || mongoose.model("Flight", FlightSchema);

export default Flight;