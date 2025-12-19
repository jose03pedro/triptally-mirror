import { TripContext, PlanOutput, DayOutput, ActivityOutput, MustVisitLocationInput } from "./types";

/**
 * Deterministic fallback plan generator.
 * Used when GEMINI_API_KEY is not available or when Gemini call fails.
 */
export function generateFallbackPlan(context: TripContext): PlanOutput {
  const { trip, travelerProfile, preferences, mustVisitLocations } = context;
  const { destinations, startDate, endDate } = trip;
  
  const pace = preferences?.pace || "moderate";
  const interests = preferences?.interests || travelerProfile?.interests || [];
  const mustVisit = preferences?.mustVisit || [];
  
  // Sort must-visit locations by priority (1 = must-see first)
  const sortedLocations = [...(mustVisitLocations || [])].sort(
    (a, b) => (a.priority || 2) - (b.priority || 2)
  );
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days: DayOutput[] = [];
  
  let currentDate = new Date(start);
  let dayIndex = 0;
  let locationIndex = 0;
  
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
    
    // Add must-visit locations from Google Places (rich data)
    if (sortedLocations.length > 0 && locationIndex < sortedLocations.length) {
      const loc = sortedLocations[locationIndex];
      const priorityLabel = loc.priority === 1 ? "Must-see" : loc.priority === 3 ? "If time permits" : "Want to see";
      
      // Schedule based on category
      let time = "10:30";
      let tags = ["must-visit", loc.category || "custom"];
      
      if (loc.category === "restaurant") {
        time = "12:30"; // Lunch time for restaurants
        tags.push("food");
      } else if (loc.category === "nightlife") {
        time = "21:00";
        tags.push("evening");
      } else if (loc.category === "museum") {
        time = "14:00";
        tags.push("culture");
      }
      
      activities.push({
        time,
        title: loc.name,
        location: loc.address || city.name,
        notes: `${priorityLabel}${loc.notes ? ` - ${loc.notes}` : ""}`,
        durationMins: loc.category === "restaurant" ? 90 : 120,
        tags,
      });
      
      locationIndex++;
    } else if (mustVisit.length > 0 && dayIndex < mustVisit.length) {
      // Fallback to simple string must-visit items
      activities.push({
        time: "10:30",
        title: mustVisit[dayIndex],
        location: city.name,
        notes: "Must-visit location from your list",
        durationMins: 120,
        tags: ["must-visit", "priority"],
      });
    }
    
    // Lunch (if not already added via restaurant must-visit)
    const hasRestaurant = activities.some(a => a.tags?.includes("food") && a.time === "12:30");
    if (activityCount >= 2 && !hasRestaurant) {
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
  const locationCount = sortedLocations.length || mustVisit.length;
  
  return {
    summary: `${days.length}-day trip to ${cityNames} with a ${pace} pace${interests.length > 0 ? `, focusing on ${interests.slice(0, 3).join(", ")}` : ""}${locationCount > 0 ? `. Includes ${locationCount} must-visit location(s).` : "."}`,
    days,
  };
}

