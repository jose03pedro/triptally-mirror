// AI Plan types and interfaces

// Rich must-visit location from Google Places
export interface MustVisitLocationInput {
  name: string;
  category?: "restaurant" | "attraction" | "museum" | "hotel" | "shopping" | "nightlife" | "custom";
  address?: string;
  coordinates?: { lat: number; lng: number };
  placeId?: string;
  notes?: string;
  priority?: 1 | 2 | 3; // 1 = must-see, 2 = want to see, 3 = if time
}

export interface TripContext {
  trip: {
    title: string;
    destinations: Array<{ name: string; country: string }>;
    startDate: string;
    endDate: string;
  };
  travelerProfile?: {
    travelFrequency?: string;
    preferredTransport?: string[];
    accommodationType?: string;
    budgetRange?: string;
    dietaryRestrictions?: string[];
    mobilityNeeds?: string;
    interests?: string[];
    languagesSpoken?: string[];
    tripStyle?: string;
  };
  preferences?: {
    pace?: "relaxed" | "moderate" | "fast";
    interests?: string[];
    mustVisit?: string[]; // Simple string array for backward compatibility
  };
  // Rich must-visit locations from Google Places
  mustVisitLocations?: MustVisitLocationInput[];
  acceptedPlan?: PlanOutput;
  updateReason?: "flight" | "weather";
  updateDelta?: Record<string, any>;
}

export interface ActivityOutput {
  time: string;
  title: string;
  location: string;
  notes: string;
  tags: string[];
  durationMins: number;
}

export interface DayOutput {
  date: string;
  activities: ActivityOutput[];
}

export interface PlanOutput {
  summary: string;
  days: DayOutput[];
}

export function validatePlanOutput(data: unknown): data is PlanOutput {
  if (!data || typeof data !== "object") return false;
  const plan = data as Record<string, unknown>;
  
  if (typeof plan.summary !== "string") return false;
  if (!Array.isArray(plan.days)) return false;
  
  for (const day of plan.days) {
    if (!day || typeof day !== "object") return false;
    if (typeof (day as Record<string, unknown>).date !== "string") return false;
    if (!Array.isArray((day as Record<string, unknown>).activities)) return false;
    
    for (const activity of (day as { activities: unknown[] }).activities) {
      if (!activity || typeof activity !== "object") return false;
      const act = activity as Record<string, unknown>;
      if (typeof act.time !== "string") return false;
      if (typeof act.title !== "string") return false;
    }
  }
  
  return true;
}

