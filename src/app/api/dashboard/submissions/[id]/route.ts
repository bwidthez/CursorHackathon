import { NextRequest, NextResponse } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

/** PATCH — approve or reject a submission (landlord). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, reviewerId } = (await request.json()) as {
      status?: "approved" | "rejected";
      reviewerId?: string;
    };

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "status must be 'approved' or 'rejected'" }, { status: 400 });
    }

    const db = await getDb();
    const sub = await db.collection(COLLECTIONS.submissions).findOne({ _id: new ObjectId(params.id) });
    if (!sub) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    await db.collection(COLLECTIONS.submissions).updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          status,
          reviewedBy: reviewerId ? new ObjectId(reviewerId) : null,
          reviewedAt: new Date(),
        },
      }
    );

    // Update the task status accordingly
    const taskStatus = status === "approved" ? "approved" : "rejected";
    await db.collection(COLLECTIONS.tasks).updateOne(
      { _id: sub.taskId },
      { $set: { status: taskStatus } }
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Submission update error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update submission" },
      { status: 500 }
    );
  }
}
