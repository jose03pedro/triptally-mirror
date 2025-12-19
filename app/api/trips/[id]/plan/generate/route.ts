import { NextRequest, NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import Plan from "@/app/models/Plan";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { generatePlanWithGemini } from "@/lib/ai/gemini";
import { buildTripContext } from "@/lib/ai/context";

// POST - Generate a new plan for a trip
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectionToDB();

    const { id: tripId } = await context.params;

    if (!tripId) {
      return NextResponse.json(
        { error: "Trip ID is required" },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Check if user is owner or collaborator with edit permissions
    const isOwner = trip.user?.toString() === currentUser.id;
    const participant = trip.participants?.find(
      (p: any) =>
        (p.user?._id?.toString() === currentUser.id ||
          p.user?.toString() === currentUser.id) &&
        (p.role === "owner" || p.role === "editor")
    );

    if (!isOwner && !participant) {
      return NextResponse.json(
        { error: "Only trip owner or editors can generate plans" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      destinations,
      startDate,
      endDate,
      preferences,
      mustVisit,
    } = body;

    // Use trip data as defaults
    const tripStartDate = startDate || trip.startDate.toISOString().split("T")[0];
    const tripEndDate = endDate || trip.endDate.toISOString().split("T")[0];
    const tripDestinations = destinations || trip.cities || [];

    if (!tripDestinations || tripDestinations.length === 0) {
      return NextResponse.json(
        { error: "At least one destination is required" },
        { status: 400 }
      );
    }

    // Get the latest plan version for this trip
    const latestPlanDoc = await Plan.findOne({ tripId })
      .sort({ version: -1 })
      .lean();

    const latestPlan = latestPlanDoc && !Array.isArray(latestPlanDoc) ? latestPlanDoc as any : null;
    const nextVersion = latestPlan ? ((latestPlan.version || 0) + 1) : 1;

    // Build trip context for AI - include mustVisitLocations from trip
    const tripContext = await buildTripContext(
      {
        _id: trip._id,
        title: trip.title,
        cities: tripDestinations,
        startDate: new Date(tripStartDate),
        endDate: new Date(tripEndDate),
        user: trip.user,
        mustVisitLocations: trip.mustVisitLocations || [],
      },
      currentUser.id,
      preferences,
      mustVisit,
      trip.mustVisitLocations // Pass rich locations from Google Places
    );

    // Generate plan using Gemini (with fallback)
    const generatedPlan = await generatePlanWithGemini(tripContext);

    // Convert to Plan model format
    const generatedDays = generatedPlan.days.map((day) => ({
      date: day.date,
      activities: day.activities.map((act) => ({
        time: act.time,
        title: act.title,
        location: act.location || "",
        notes: act.notes || "",
        tags: act.tags || [],
        estimatedDuration: act.durationMins,
      })),
    }));

    // Create new plan as draft
    const plan = await Plan.create({
      tripId,
      version: nextVersion,
      status: "draft",
      generatedBy: "ai",
      days: generatedDays,
      reason: "initial",
    });

    return NextResponse.json(
      {
        plan: {
          _id: plan._id,
          tripId: plan.tripId,
          version: plan.version,
          status: plan.status,
          generatedBy: plan.generatedBy,
          days: plan.days,
          createdAt: plan.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error generating plan:", error);
    return NextResponse.json(
      { error: "Failed to generate plan", details: error.message },
      { status: 500 }
    );
  }
}

