import mongoose, { Schema } from 'mongoose';

const travelerProfileSchema = new Schema({
  // Use the User's _id as the primary key for the profile
  _id: {
    type: Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  
  travelFrequency: { type: String, default: '' },
  preferredTransport: { type: [String], default: [] },
  accommodationType: { type: String, default: '' },
  budgetRange: { type: String, default: '' },
  dietaryRestrictions: { type: [String], default: [] },
  mobilityNeeds: { type: String, default: '' },
  interests: { type: [String], default: [] },
  languagesSpoken: { type: [String], default: [] },
  tripStyle: { type: String, default: '' },
  notes: { type: String, default: '' },
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Ensure only one profile exists per user ID
travelerProfileSchema.index({ _id: 1 }, { unique: true });

export const TravelerProfile = mongoose.models.TravelerProfile || mongoose.model('TravelerProfile', travelerProfileSchema);