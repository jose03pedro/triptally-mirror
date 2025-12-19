/**
 * Integration test for POST /api/ai/plan/preview
 * Tests fallback mode (no GEMINI_API_KEY)
 */

import { generateFallbackPlan } from "@/lib/ai/fallbackPlan";
import { validatePlanOutput } from "@/lib/ai/types";

// Ensure GEMINI_API_KEY is not set (forces fallback)
const originalEnv = process.env;
beforeAll(() => {
  process.env = { ...originalEnv };
  delete process.env.GEMINI_API_KEY;
});

afterAll(() => {
  process.env = originalEnv;
});

describe("AI Plan Preview Fallback", () => {
  it("generates a valid plan output using fallback", () => {
    const context = {
      trip: {
        title: "Test Trip",
        destinations: [{ name: "Paris", country: "France" }],
        startDate: "2025-01-01",
        endDate: "2025-01-03",
      },
      preferences: { pace: "moderate" as const, interests: [], mustVisit: [] },
    };

    const result = generateFallbackPlan(context);

    // Validate structure
    expect(result).toHaveProperty("summary");
    expect(result).toHaveProperty("days");
    expect(Array.isArray(result.days)).toBe(true);
    expect(result.days.length).toBeGreaterThan(0);

    // Check day structure
    const firstDay = result.days[0];
    expect(firstDay).toHaveProperty("date");
    expect(firstDay).toHaveProperty("activities");
    expect(Array.isArray(firstDay.activities)).toBe(true);

    // Check activity structure
    if (firstDay.activities.length > 0) {
      const firstActivity = firstDay.activities[0];
      expect(firstActivity).toHaveProperty("time");
      expect(firstActivity).toHaveProperty("title");
    }

    // Validate against schema
    expect(validatePlanOutput(result)).toBe(true);
  });

  it("generates correct number of days based on trip dates", () => {
    const context = {
      trip: {
        title: "Test Trip",
        destinations: [{ name: "Paris", country: "France" }],
        startDate: "2025-01-01",
        endDate: "2025-01-05",
      },
      preferences: { pace: "moderate" as const, interests: [], mustVisit: [] },
    };

    const result = generateFallbackPlan(context);

    // 5 days (Jan 1-5 inclusive)
    expect(result.days.length).toBe(5);
  });

  it("generates activities for multiple destinations", () => {
    const context = {
      trip: {
        title: "Multi-city Trip",
        destinations: [
          { name: "Paris", country: "France" },
          { name: "London", country: "UK" },
        ],
        startDate: "2025-01-01",
        endDate: "2025-01-02",
      },
      preferences: { pace: "moderate" as const, interests: [], mustVisit: [] },
    };

    const result = generateFallbackPlan(context);

    expect(result.days.length).toBe(2);
    expect(result.days.every(d => d.activities.length > 0)).toBe(true);
  });

  it("handles different pace preferences", () => {
    const baseContext = {
      trip: {
        title: "Test Trip",
        destinations: [{ name: "Paris", country: "France" }],
        startDate: "2025-01-01",
        endDate: "2025-01-01",
      },
    };

    const relaxedPlan = generateFallbackPlan({
      ...baseContext,
      preferences: { pace: "relaxed" as const, interests: [], mustVisit: [] },
    });

    const fastPlan = generateFallbackPlan({
      ...baseContext,
      preferences: { pace: "fast" as const, interests: [], mustVisit: [] },
    });

    // Both should be valid
    expect(validatePlanOutput(relaxedPlan)).toBe(true);
    expect(validatePlanOutput(fastPlan)).toBe(true);
  });

  it("includes must-visit locations from Google Places in the plan", () => {
    const context = {
      trip: {
        title: "Paris Trip",
        destinations: [{ name: "Paris", country: "France" }],
        startDate: "2025-01-01",
        endDate: "2025-01-03",
      },
      preferences: { pace: "moderate" as const, interests: [], mustVisit: [] },
      mustVisitLocations: [
        {
          name: "Eiffel Tower",
          category: "attraction" as const,
          address: "Champ de Mars, 5 Av. Anatole France, 75007 Paris",
          placeId: "ChIJLU7jZClu5kcR4PcOOO6p3I0",
          notes: "Must see at sunset",
          priority: 1 as const,
        },
        {
          name: "Le Jules Verne",
          category: "restaurant" as const,
          address: "Eiffel Tower, Avenue Gustave Eiffel, Paris",
          placeId: "ChIJe9XMwiBu5kcRLs8qAuPhFFg",
          priority: 2 as const,
        },
      ],
    };

    const result = generateFallbackPlan(context);

    // Should include the must-visit locations
    const allActivities = result.days.flatMap(d => d.activities);
    const eiffelActivity = allActivities.find(a => a.title === "Eiffel Tower");
    const restaurantActivity = allActivities.find(a => a.title === "Le Jules Verne");

    expect(eiffelActivity).toBeDefined();
    expect(eiffelActivity?.location).toContain("Champ de Mars");
    expect(eiffelActivity?.notes).toContain("Must-see");
    expect(eiffelActivity?.tags).toContain("must-visit");
    expect(eiffelActivity?.tags).toContain("attraction");

    expect(restaurantActivity).toBeDefined();
    expect(restaurantActivity?.time).toBe("12:30"); // Restaurants scheduled at lunch
    expect(restaurantActivity?.tags).toContain("food");
  });

  it("prioritizes must-visit locations by priority level", () => {
    const context = {
      trip: {
        title: "Short Trip",
        destinations: [{ name: "Paris", country: "France" }],
        startDate: "2025-01-01",
        endDate: "2025-01-01", // Only 1 day
      },
      mustVisitLocations: [
        { name: "Low Priority Place", priority: 3 as const },
        { name: "High Priority Place", priority: 1 as const },
        { name: "Medium Priority Place", priority: 2 as const },
      ],
    };

    const result = generateFallbackPlan(context);

    // With only 1 day, should include the highest priority location first
    const allActivities = result.days.flatMap(d => d.activities);
    const highPriorityActivity = allActivities.find(a => a.title === "High Priority Place");

    expect(highPriorityActivity).toBeDefined();
  });
});
