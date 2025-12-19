import { NextRequest, NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import Plan from "@/app/models/Plan";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

// GET - Get all plan versions for a trip
export async function GET(
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

    const plans = await Plan.find({ tripId })
      .sort({ version: -1 })
      .select("_id version status generatedBy createdAt updatedAt reason parentPlanId")
      .lean();

    return NextResponse.json(
      {
        versions: plans.map((p: any) => ({
          _id: p._id,
          version: p.version,
          status: p.status,
          generatedBy: p.generatedBy,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          reason: p.reason,
          parentPlanId: p.parentPlanId,
          isCurrent: trip.currentPlanId?.toString() === p._id?.toString(),
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching plan versions:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan versions" },
      { status: 500 }
    );
  }
}

