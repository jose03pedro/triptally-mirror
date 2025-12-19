import { TripContext, MustVisitLocationInput } from "./types";
import { TravelerProfile } from "@/app/models/TravelerProfile";
import connectionToDB from "@/lib/mongoose";

interface TripData {
  _id: any;
  title: string;
  cities: Array<{ name: string; country: string }>;
  startDate: Date;
  endDate: Date;
  user: any;
  mustVisitLocations?: Array<{
    name: string;
    category?: string;
    address?: string;
    coordinates?: { lat: number; lng: number };
    placeId?: string;
    notes?: string;
    priority?: number;
  }>;
}

interface Preferences {
  pace?: "relaxed" | "moderate" | "fast";
  interests?: string[];
  mustVisit?: string[];
}

/**
 * Build a TripContext object for AI plan generation
 */
export async function buildTripContext(
  trip: TripData,
  userId: string,
  preferences?: Preferences,
  mustVisit?: string[],
  mustVisitLocations?: MustVisitLocationInput[]
): Promise<TripContext> {
  await connectionToDB();

  // Fetch traveler profile if exists
  let travelerProfile: any = null;
  try {
    const profileDoc = await TravelerProfile.findById(userId).lean();
    if (profileDoc && !Array.isArray(profileDoc)) {
      travelerProfile = profileDoc;
    }
  } catch (err) {
    console.log("No traveler profile found for user:", userId);
  }

  const context: TripContext = {
    trip: {
      title: trip.title,
      destinations: trip.cities.map((c) => ({
        name: c.name,
        country: c.country,
      })),
      startDate: trip.startDate.toISOString().split("T")[0],
      endDate: trip.endDate.toISOString().split("T")[0],
    },
  };

  // Add traveler profile if available
  if (travelerProfile) {
    context.travelerProfile = {
      travelFrequency: travelerProfile.travelFrequency,
      preferredTransport: travelerProfile.preferredTransport,
      accommodationType: travelerProfile.accommodationType,
      budgetRange: travelerProfile.budgetRange,
      dietaryRestrictions: travelerProfile.dietaryRestrictions,
      mobilityNeeds: travelerProfile.mobilityNeeds,
      interests: travelerProfile.interests,
      languagesSpoken: travelerProfile.languagesSpoken,
      tripStyle: travelerProfile.tripStyle,
    };
  }

  // Add preferences
  if (preferences || mustVisit) {
    context.preferences = {
      pace: preferences?.pace,
      interests: preferences?.interests || travelerProfile?.interests,
      mustVisit: mustVisit || preferences?.mustVisit,
    };
  }

  // Add rich must-visit locations from Google Places
  // Priority: explicitly passed locations > trip's stored locations
  const richLocations = mustVisitLocations || trip.mustVisitLocations;
  if (richLocations && richLocations.length > 0) {
    context.mustVisitLocations = richLocations.map((loc) => ({
      name: loc.name,
      category: loc.category as MustVisitLocationInput["category"],
      address: loc.address,
      coordinates: loc.coordinates,
      placeId: loc.placeId,
      notes: loc.notes,
      priority: loc.priority as MustVisitLocationInput["priority"],
    }));
  }

  return context;
}

