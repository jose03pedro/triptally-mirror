import { NextRequest, NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import Plan from "@/app/models/Plan";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { PlanDay, Activity } from "@/app/models/Plan";

// GET - Get a specific plan
export async function GET(
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
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Check access: owner, collaborator, or public
    const isOwner = currentUser && trip.user?.toString() === currentUser.id;
    const isCollaborator = currentUser
      ? trip.participants?.some(
          (p: any) =>
            p.user?._id?.toString() === currentUser.id ||
            p.user?.toString() === currentUser.id
        )
      : false;

    if (!trip.isPublic && !isOwner && !isCollaborator) {
      return NextResponse.json(
        { error: "Access denied" },
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

    return NextResponse.json({ plan }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan" },
      { status: 500 }
    );
  }
}

// PATCH - Edit a plan
export async function PATCH(
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
        { error: "Only trip owner or editors can edit plans" },
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

    const body = await request.json();
    const { days, addActivity, removeActivity, updateActivity } = body;

    // If days array provided, replace entire days array
    if (days && Array.isArray(days)) {
      // Validate days are within trip date range
      const tripStart = new Date(trip.startDate);
      const tripEnd = new Date(trip.endDate);

      for (const day of days) {
        const dayDate = new Date(day.date);
        if (dayDate < tripStart || dayDate > tripEnd) {
          return NextResponse.json(
            { error: `Day date ${day.date} is outside trip date range` },
            { status: 400 }
          );
        }
      }

      plan.days = days;
      plan.generatedBy = "user"; // Mark as user-edited
    }

    // Add activity
    if (addActivity) {
      const { dayDate, activity } = addActivity;
      const day = plan.days.find((d: PlanDay) => d.date === dayDate);
      if (!day) {
        return NextResponse.json(
          { error: `Day ${dayDate} not found in plan` },
          { status: 400 }
        );
      }
      if (!day.activities) {
        day.activities = [];
      }
      day.activities.push(activity);
      // Sort by time
      day.activities.sort((a: Activity, b: Activity) => a.time.localeCompare(b.time));
      plan.generatedBy = "user";
    }

    // Remove activity
    if (removeActivity) {
      const { dayDate, activityIndex } = removeActivity;
      const day = plan.days.find((d: PlanDay) => d.date === dayDate);
      if (!day || !day.activities) {
        return NextResponse.json(
          { error: `Day ${dayDate} or activity not found` },
          { status: 400 }
        );
      }
      if (activityIndex < 0 || activityIndex >= day.activities.length) {
        return NextResponse.json(
          { error: "Invalid activity index" },
          { status: 400 }
        );
      }
      day.activities.splice(activityIndex, 1);
      plan.generatedBy = "user";
    }

    // Update activity
    if (updateActivity) {
      const { dayDate, activityIndex, activity } = updateActivity;
      const day = plan.days.find((d: PlanDay) => d.date === dayDate);
      if (!day || !day.activities) {
        return NextResponse.json(
          { error: `Day ${dayDate} or activity not found` },
          { status: 400 }
        );
      }
      if (activityIndex < 0 || activityIndex >= day.activities.length) {
        return NextResponse.json(
          { error: "Invalid activity index" },
          { status: 400 }
        );
      }
      day.activities[activityIndex] = { ...day.activities[activityIndex], ...activity };
      // Re-sort by time
      day.activities.sort((a: Activity, b: Activity) => a.time.localeCompare(b.time));
      plan.generatedBy = "user";
    }

    await plan.save();

    return NextResponse.json(
      {
        message: "Plan updated successfully",
        plan: {
          _id: plan._id,
          version: plan.version,
          status: plan.status,
          days: plan.days,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { error: "Failed to update plan", details: error.message },
      { status: 500 }
    );
  }
}

