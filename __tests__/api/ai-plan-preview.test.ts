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
});

