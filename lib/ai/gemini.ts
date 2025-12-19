import { TripContext, PlanOutput, validatePlanOutput } from "./types";
import { generateFallbackPlan } from "./fallbackPlan";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

const PLAN_SCHEMA_PROMPT = `
You are a travel planning AI. Generate a detailed trip itinerary based on the provided context.

IMPORTANT: Your response MUST be valid JSON matching this exact schema:
{
  "summary": "string describing the trip overview",
  "days": [
    {
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "time": "HH:MM",
          "title": "string",
          "location": "string",
          "notes": "string",
          "tags": ["string"],
          "durationMins": number
        }
      ]
    }
  ]
}

Guidelines:
- Create realistic, enjoyable activities
- Consider the traveler's preferences and interests
- Include meal breaks
- Account for travel time between locations
- Respect the pace preference (relaxed = fewer activities, fast = more activities)
- Include must-visit locations on appropriate days
- Be culturally aware and suggest authentic experiences
- Activities should be sorted by time within each day

Return ONLY the JSON object, no markdown formatting or additional text.
`;

export async function generatePlanWithGemini(context: TripContext): Promise<PlanOutput> {
  // If no API key, use fallback immediately
  if (!GEMINI_API_KEY) {
    console.log("No GEMINI_API_KEY found, using fallback plan generator");
    return generateFallbackPlan(context);
  }

  try {
    const contextJson = JSON.stringify(context, null, 2);
    const prompt = `${PLAN_SCHEMA_PROMPT}\n\nTrip Context:\n${contextJson}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", response.status, await response.text());
      console.log("Falling back to deterministic plan generator");
      return generateFallbackPlan(context);
    }

    const data = await response.json();
    
    // Extract the text from Gemini response
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error("No text in Gemini response");
      return generateFallbackPlan(context);
    }

    // Parse the JSON response
    let planData: unknown;
    try {
      // Try to extract JSON from the response (in case it has markdown formatting)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        planData = JSON.parse(jsonMatch[0]);
      } else {
        planData = JSON.parse(text);
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", parseError);
      return generateFallbackPlan(context);
    }

    // Validate the response
    if (!validatePlanOutput(planData)) {
      console.error("Gemini response does not match expected schema");
      return generateFallbackPlan(context);
    }

    return planData;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return generateFallbackPlan(context);
  }
}

/**
 * Generate a recomputed plan based on changes (flight delay, weather, etc.)
 */
export async function recomputePlanWithGemini(
  context: TripContext,
  currentPlan: PlanOutput,
  reason: "flight" | "weather",
  delta: Record<string, any>
): Promise<PlanOutput> {
  // If no API key, use fallback
  if (!GEMINI_API_KEY) {
    console.log("No GEMINI_API_KEY found, using fallback plan generator for recompute");
    return generateFallbackPlan({
      ...context,
      updateReason: reason,
      updateDelta: delta,
    });
  }

  try {
    const recomputePrompt = `${PLAN_SCHEMA_PROMPT}

You are recomputing an existing trip plan due to ${reason === "flight" ? "flight schedule changes" : "weather changes"}.

Current Plan:
${JSON.stringify(currentPlan, null, 2)}

Changes to account for:
${JSON.stringify(delta, null, 2)}

Trip Context:
${JSON.stringify(context, null, 2)}

Please adjust the itinerary to accommodate these changes while preserving as much of the original plan as possible.
Return ONLY the JSON object.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: recomputePrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error during recompute:", response.status);
      return generateFallbackPlan(context);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      return generateFallbackPlan(context);
    }

    let planData: unknown;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        planData = JSON.parse(jsonMatch[0]);
      } else {
        planData = JSON.parse(text);
      }
    } catch {
      return generateFallbackPlan(context);
    }

    if (!validatePlanOutput(planData)) {
      return generateFallbackPlan(context);
    }

    return planData;
  } catch (error) {
    console.error("Error recomputing plan with Gemini:", error);
    return generateFallbackPlan(context);
  }
}

