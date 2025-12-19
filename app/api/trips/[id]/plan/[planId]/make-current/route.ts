import { NextRequest, NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import Plan from "@/app/models/Plan";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

// POST - Make a plan version current (creates a copy as new version)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; planId: string }> }
) {
  try {
    await connectionToDB();

    const { id: tripId, planId } = await context.params;

    if (!tripId || !planId) {
      return NextResponse.json(
        { error: "Trip ID and Plan ID are required" },
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

    // Check if user is owner or editor
    const isOwner = trip.user?.toString() === currentUser.id;
    const participant = trip.participants?.find(
      (p: { user?: { _id?: { toString: () => string } } | string; role?: string }) =>
        (p.user && typeof p.user === "object" && "_id" in p.user
          ? p.user._id?.toString() === currentUser.id
          : p.user?.toString() === currentUser.id) &&
        (p.role === "owner" || p.role === "editor")
    );

    if (!isOwner && !participant) {
      return NextResponse.json(
        { error: "Only trip owner or editors can set current plan" },
        { status: 403 }
      );
    }

    const sourcePlan = await Plan.findById(planId);
    if (!sourcePlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (sourcePlan.tripId.toString() !== tripId) {
      return NextResponse.json(
        { error: "Plan does not belong to this trip" },
        { status: 400 }
      );
    }

    // Get the latest plan version
    const latestPlan = await Plan.findOne({ tripId })
      .sort({ version: -1 })
      .select("version")
      .lean();

    const nextVersion = latestPlan && !Array.isArray(latestPlan) && "version" in latestPlan
      ? ((latestPlan.version as number) || 0) + 1
      : 1;

    // Create a new version as a copy
    const newPlan = await Plan.create({
      tripId,
      version: nextVersion,
      status: "accepted",
      generatedBy: "user",
      days: JSON.parse(JSON.stringify(sourcePlan.days)), // Deep copy
      parentPlanId: sourcePlan._id,
      reason: "revert",
    });

    // Update trip's current plan
    trip.currentPlanId = newPlan._id;
    await trip.save();

    return NextResponse.json(
      {
        message: "Plan version set as current",
        plan: {
          _id: newPlan._id,
          version: newPlan.version,
          status: newPlan.status,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error making plan current:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to set plan as current", details: errorMessage },
      { status: 500 }
    );
  }
}

