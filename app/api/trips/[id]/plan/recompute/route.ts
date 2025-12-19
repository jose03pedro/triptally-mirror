import { NextRequest, NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import Plan from "@/app/models/Plan";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { recomputePlanWithGemini } from "@/lib/ai/gemini";
import { buildTripContext } from "@/lib/ai/context";
import { PlanOutput } from "@/lib/ai/types";
import { createNotification } from "@/app/actions/notification/createNotification";
import NotificationType from "@/app/models/NotificationType";

// POST - Recompute plan based on changes (flight delay, weather, etc.)
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
        { error: "Only trip owner or editors can recompute plans" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reason, delta } = body;

    if (!reason || !["flight", "weather"].includes(reason)) {
      return NextResponse.json(
        { error: "Reason must be 'flight' or 'weather'" },
        { status: 400 }
      );
    }

    // Get the current accepted plan
    const currentPlan = trip.currentPlanId
      ? await Plan.findById(trip.currentPlanId)
      : null;

    if (!currentPlan) {
      return NextResponse.json(
        { error: "No accepted plan found. Please generate a plan first." },
        { status: 400 }
      );
    }

    // Get the latest plan version
    const latestPlanDoc = await Plan.findOne({ tripId })
      .sort({ version: -1 })
      .lean();

    const latestPlan = latestPlanDoc && !Array.isArray(latestPlanDoc) ? latestPlanDoc as any : null;
    const nextVersion = latestPlan ? ((latestPlan.version || 0) + 1) : 1;

    // Build trip context
    const tripContext = await buildTripContext(
      {
        _id: trip._id,
        title: trip.title,
        cities: trip.cities || [],
        startDate: trip.startDate,
        endDate: trip.endDate,
        user: trip.user,
      },
      currentUser.id
    );

    // Convert current plan to PlanOutput format
    const currentPlanOutput: PlanOutput = {
      summary: `Current plan for ${trip.title}`,
      days: currentPlan.days.map((day: any) => ({
        date: day.date,
        activities: day.activities.map((act: any) => ({
          time: act.time,
          title: act.title,
          location: act.location || "",
          notes: act.notes || "",
          tags: act.tags || [],
          durationMins: act.estimatedDuration || 60,
        })),
      })),
    };

    // Generate new plan using Gemini (with fallback)
    const generatedPlan = await recomputePlanWithGemini(
      tripContext,
      currentPlanOutput,
      reason,
      delta || {}
    );

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

    // Create new draft plan
    const newPlan = await Plan.create({
      tripId,
      version: nextVersion,
      status: "draft",
      generatedBy: "ai",
      days: generatedDays,
      parentPlanId: currentPlan._id,
      reason: reason === "flight" ? "flight_delay" : "weather_change",
    });

    // Create notification for trip owner and collaborators (US313)
    try {
      // Find or create PLAN_UPDATE notification type
      let planUpdateType = await NotificationType.findOne({ name: "PLAN_UPDATE" });
      if (!planUpdateType) {
        planUpdateType = await NotificationType.create({
          name: "PLAN_UPDATE",
          icon: "/notifications/tripsaved.png", // Use existing icon or create new one
        });
      }

      // Notify trip owner
      await createNotification({
        userId: trip.user.toString(),
        typeId: planUpdateType._id.toString(),
        title: "Plan Update Available",
        message: `A new plan suggestion is available for your trip "${trip.title}" due to ${reason === "flight" ? "flight changes" : "weather changes"}.`,
        link: `/trips/${tripId}?tab=plan`,
      });

      // Notify collaborators
      if (trip.participants) {
        for (const participant of trip.participants) {
          const participantId =
            participant.user?._id?.toString() ||
            participant.user?.toString();
          if (participantId && participantId !== trip.user.toString()) {
            await createNotification({
              userId: participantId,
              typeId: planUpdateType._id.toString(),
              title: "Plan Update Available",
              message: `A new plan suggestion is available for "${trip.title}" due to ${reason === "flight" ? "flight changes" : "weather changes"}.`,
              link: `/trips/${tripId}?tab=plan`,
            });
          }
        }
      }
    } catch (notifError) {
      console.error("Error creating notifications:", notifError);
      // Don't fail the recompute if notification fails
    }

    return NextResponse.json(
      {
        message: "Plan recomputed successfully",
        plan: {
          _id: newPlan._id,
          tripId: newPlan.tripId,
          version: newPlan.version,
          status: newPlan.status,
          generatedBy: newPlan.generatedBy,
          days: newPlan.days,
          createdAt: newPlan.createdAt,
          reason: newPlan.reason,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error recomputing plan:", error);
    return NextResponse.json(
      { error: "Failed to recompute plan", details: error.message },
      { status: 500 }
    );
  }
}

