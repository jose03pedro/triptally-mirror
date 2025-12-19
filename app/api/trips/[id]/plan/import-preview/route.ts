import { NextRequest, NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import Plan from "@/app/models/Plan";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

// POST - Import a preview plan as the trip's initial plan
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

    // Check if user is owner
    const isOwner = trip.user?.toString() === currentUser.id;
    if (!isOwner) {
      return NextResponse.json(
        { error: "Only trip owner can import plans" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { plan } = body;

    if (!plan || !plan.days || !Array.isArray(plan.days)) {
      return NextResponse.json(
        { error: "Valid plan with days array is required" },
        { status: 400 }
      );
    }

    // Get the latest plan version for this trip
    const latestPlanDoc = await Plan.findOne({ tripId })
      .sort({ version: -1 })
      .lean();

    const latestPlan = latestPlanDoc && !Array.isArray(latestPlanDoc) ? latestPlanDoc as any : null;
    const nextVersion = latestPlan ? ((latestPlan.version || 0) + 1) : 1;

    // Convert plan to Plan model format
    const days = plan.days.map((day: any) => ({
      date: day.date,
      activities: (day.activities || []).map((act: any) => ({
        time: act.time,
        title: act.title,
        location: act.location || "",
        notes: act.notes || "",
        tags: act.tags || [],
        estimatedDuration: act.durationMins || act.estimatedDuration || 60,
      })),
    }));

    // Create plan as draft
    const newPlan = await Plan.create({
      tripId,
      version: nextVersion,
      status: "draft",
      generatedBy: "ai",
      days,
      reason: "imported_preview",
    });

    return NextResponse.json(
      {
        message: "Plan imported successfully",
        plan: {
          _id: newPlan._id,
          tripId: newPlan.tripId,
          version: newPlan.version,
          status: newPlan.status,
          generatedBy: newPlan.generatedBy,
          days: newPlan.days,
          createdAt: newPlan.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error importing plan preview:", error);
    return NextResponse.json(
      { error: "Failed to import plan", details: error.message },
      { status: 500 }
    );
  }
}

