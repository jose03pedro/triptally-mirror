import { PlanDay, Activity } from "@/app/models/Plan";

export interface GeneratePlanInput {
  destinations: Array<{ name: string; country: string }>;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  preferences?: {
    pace?: "relaxed" | "moderate" | "fast";
    interests?: string[];
    mustVisit?: string[];
  };
}

/**
 * Fallback plan generator (deterministic, no AI required)
 * Creates a basic itinerary based on destinations and dates
 */
export function generatePlan(input: GeneratePlanInput): PlanDay[] {
  const { destinations, startDate, endDate, preferences } = input;
  const pace = preferences?.pace || "moderate";
  const interests = preferences?.interests || [];
  const mustVisit = preferences?.mustVisit || [];

  const start = new Date(startDate);
  const end = new Date(endDate);
  const days: PlanDay[] = [];

  let currentDate = new Date(start);
  let dayIndex = 0;

  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const activities: Activity[] = [];

    // Determine which city to visit (rotate through destinations)
    const cityIndex = dayIndex % destinations.length;
    const city = destinations[cityIndex];

    // Generate activities based on pace
    let activityCount = 2; // Default moderate
    if (pace === "relaxed") {
      activityCount = 1;
    } else if (pace === "fast") {
      activityCount = 3;
    }

    // Morning activity
    if (activityCount >= 1) {
      activities.push({
        time: "09:00",
        title: `Explore ${city.name}`,
        location: city.name,
        notes: "Morning exploration",
        estimatedDuration: 180, // 3 hours
        tags: ["exploration", "sightseeing"],
      });
    }

    // Afternoon activity
    if (activityCount >= 2) {
      activities.push({
        time: "14:00",
        title: "Lunch and local experience",
        location: city.name,
        notes: "Try local cuisine",
        estimatedDuration: 120, // 2 hours
        tags: ["food", "culture"],
      });
    }

    // Evening activity
    if (activityCount >= 3) {
      activities.push({
        time: "18:00",
        title: "Evening activities",
        location: city.name,
        notes: "Evening exploration",
        estimatedDuration: 180, // 3 hours
        tags: ["evening"],
      });
    }

    // Add must-visit items if specified
    if (mustVisit.length > 0 && dayIndex < mustVisit.length) {
      activities.push({
        time: "10:00",
        title: mustVisit[dayIndex],
        location: city.name,
        notes: "Must-visit location",
        estimatedDuration: 120,
        tags: ["must-visit"],
      });
    }

    // Add interest-based activities
    if (interests.includes("hiking") && dayIndex % 3 === 0) {
      activities.push({
        time: "08:00",
        title: "Hiking trail",
        location: city.name,
        notes: "Nature hike",
        estimatedDuration: 240,
        tags: ["hiking", "nature"],
      });
    }

    if (interests.includes("museums") && dayIndex % 2 === 0) {
      activities.push({
        time: "11:00",
        title: "Museum visit",
        location: city.name,
        notes: "Cultural experience",
        estimatedDuration: 120,
        tags: ["museum", "culture"],
      });
    }

    // Sort activities by time
    activities.sort((a, b) => a.time.localeCompare(b.time));

    days.push({
      date: dateStr,
      activities,
    });

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
    dayIndex++;
  }

  return days;
}

