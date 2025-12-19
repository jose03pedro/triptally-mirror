import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { generatePlanWithGemini } from "@/lib/ai/gemini";
import { TripContext } from "@/lib/ai/types";
import { TravelerProfile } from "@/app/models/TravelerProfile";
import connectionToDB from "@/lib/mongoose";

// POST - Generate AI plan preview (before trip exists)
export async function POST(req: NextRequest) {
  try {
    await connectionToDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, startDate, endDate, destinations, cities, preferences } = body;

    // Validate required fields
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start and end dates are required" },
        { status: 400 }
      );
    }

    // Accept either destinations or cities
    const rawDestinations = destinations || cities || [];
    if (!Array.isArray(rawDestinations) || rawDestinations.length === 0) {
      return NextResponse.json(
        { error: "At least one destination is required" },
        { status: 400 }
      );
    }

    // Normalize destinations
    const normalizedDestinations = rawDestinations.map((d: any) => {
      if (typeof d === "string") {
        return { name: d, country: "Unknown" };
      }
      return {
        name: d.name || d.city || "Unknown",
        country: d.country || "Unknown",
      };
    });

    // Fetch traveler profile for personalization
    let travelerProfile: any = null;
    try {
      const profileDoc = await TravelerProfile.findById(currentUser.id).lean();
      if (profileDoc && !Array.isArray(profileDoc)) {
        travelerProfile = profileDoc;
      }
    } catch (err) {
      console.log("No traveler profile found for preview");
    }

    // Build TripContext
    const context: TripContext = {
      trip: {
        title: title || "Trip Preview",
        destinations: normalizedDestinations,
        startDate: new Date(startDate).toISOString().split("T")[0],
        endDate: new Date(endDate).toISOString().split("T")[0],
      },
      preferences: {
        pace: preferences?.pace || "moderate",
        interests: preferences?.interests || travelerProfile?.interests || [],
        mustVisit: preferences?.mustVisit || [],
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

    // Generate plan using Gemini (with fallback)
    const plan = await generatePlanWithGemini(context);

    return NextResponse.json({ plan }, { status: 200 });
  } catch (error: any) {
    console.error("Error generating plan preview:", error);
    return NextResponse.json(
      { error: "Failed to generate plan preview", details: error.message },
      { status: 500 }
    );
  }
}

