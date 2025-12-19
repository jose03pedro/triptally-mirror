import { TripContext, PlanOutput, DayOutput, ActivityOutput } from "./types";

/**
 * Deterministic fallback plan generator.
 * Used when GEMINI_API_KEY is not available or when Gemini call fails.
 */
export function generateFallbackPlan(context: TripContext): PlanOutput {
  const { trip, travelerProfile, preferences } = context;
  const { destinations, startDate, endDate } = trip;
  
  const pace = preferences?.pace || "moderate";
  const interests = preferences?.interests || travelerProfile?.interests || [];
  const mustVisit = preferences?.mustVisit || [];
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days: DayOutput[] = [];
  
  let currentDate = new Date(start);
  let dayIndex = 0;
  
  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const activities: ActivityOutput[] = [];
    
    // Rotate through destinations
    const cityIndex = dayIndex % (destinations.length || 1);
    const city = destinations[cityIndex] || { name: "Unknown", country: "" };
    
    // Determine activity count based on pace
    let activityCount = 3;
    if (pace === "relaxed") {
      activityCount = 2;
    } else if (pace === "fast") {
      activityCount = 4;
    }
    
    // Morning activity
    activities.push({
      time: "09:00",
      title: `Explore ${city.name}`,
      location: city.name,
      notes: "Morning exploration of the city",
      durationMins: 180,
      tags: ["exploration", "sightseeing"],
    });
    
    // Lunch
    if (activityCount >= 2) {
      activities.push({
        time: "12:30",
        title: "Local lunch experience",
        location: city.name,
        notes: "Try authentic local cuisine",
        durationMins: 90,
        tags: ["food", "culture"],
      });
    }
    
    // Afternoon activity
    if (activityCount >= 3) {
      activities.push({
        time: "14:30",
        title: `Visit attractions in ${city.name}`,
        location: city.name,
        notes: "Explore local landmarks and attractions",
        durationMins: 180,
        tags: ["sightseeing", "culture"],
      });
    }
    
    // Evening activity
    if (activityCount >= 4) {
      activities.push({
        time: "18:00",
        title: "Evening activities",
        location: city.name,
        notes: "Enjoy the evening atmosphere",
        durationMins: 180,
        tags: ["evening", "leisure"],
      });
    }
    
    // Add must-visit items
    if (mustVisit.length > 0 && dayIndex < mustVisit.length) {
      activities.push({
        time: "10:30",
        title: mustVisit[dayIndex],
        location: city.name,
        notes: "Must-visit location from your list",
        durationMins: 120,
        tags: ["must-visit", "priority"],
      });
    }
    
    // Add interest-based activities
    if (interests.includes("hiking") && dayIndex % 3 === 0) {
      activities.push({
        time: "07:00",
        title: "Morning hike",
        location: city.name,
        notes: "Nature trail or hiking adventure",
        durationMins: 180,
        tags: ["hiking", "nature", "outdoor"],
      });
    }
    
    if (interests.includes("museums") && dayIndex % 2 === 0) {
      activities.push({
        time: "11:00",
        title: "Museum visit",
        location: city.name,
        notes: "Explore local museums and cultural exhibits",
        durationMins: 120,
        tags: ["museum", "culture", "history"],
      });
    }
    
    if (interests.includes("food") || interests.includes("culinary")) {
      activities.push({
        time: "19:30",
        title: "Food tour or cooking class",
        location: city.name,
        notes: "Culinary experience",
        durationMins: 150,
        tags: ["food", "culinary", "experience"],
      });
    }
    
    // Sort activities by time
    activities.sort((a, b) => a.time.localeCompare(b.time));
    
    days.push({
      date: dateStr,
      activities,
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
    dayIndex++;
  }
  
  const cityNames = destinations.map(d => d.name).join(", ");
  
  return {
    summary: `${days.length}-day trip to ${cityNames} with a ${pace} pace${interests.length > 0 ? `, focusing on ${interests.slice(0, 3).join(", ")}` : ""}.`,
    days,
  };
}

