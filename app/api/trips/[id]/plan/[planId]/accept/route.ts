import { NextRequest, NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import Plan from "@/app/models/Plan";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

// POST - Accept a plan (set it as current)
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
      (p: any) =>
        (p.user?._id?.toString() === currentUser.id ||
          p.user?.toString() === currentUser.id) &&
        (p.role === "owner" || p.role === "editor")
    );

    if (!isOwner && !participant) {
      return NextResponse.json(
        { error: "Only trip owner or editors can accept plans" },
        { status: 403 }
      );
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (plan.tripId.toString() !== tripId) {
      return NextResponse.json(
        { error: "Plan does not belong to this trip" },
        { status: 400 }
      );
    }

    if (plan.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft plans can be accepted" },
        { status: 400 }
      );
    }

    // Mark plan as accepted
    plan.status = "accepted";
    await plan.save();

    // Update trip's current plan
    trip.currentPlanId = plan._id;
    await trip.save();

    return NextResponse.json(
      {
        message: "Plan accepted successfully",
        plan: {
          _id: plan._id,
          version: plan.version,
          status: plan.status,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error accepting plan:", error);
    return NextResponse.json(
      { error: "Failed to accept plan", details: error.message },
      { status: 500 }
    );
  }
}

