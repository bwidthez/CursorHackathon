import { NextRequest, NextResponse } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

/** GET submissions for a task.  POST — submit evidence (tenant). */
export async function GET(request: NextRequest) {
  try {
    const taskId = request.nextUrl.searchParams.get("taskId");
    const db = await getDb();
    const filter: Record<string, unknown> = {};
    if (taskId) filter.taskId = new ObjectId(taskId);

    const submissions = await db
      .collection(COLLECTIONS.submissions)
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    const tenantIds = [...new Set(submissions.map((s) => s.tenantId.toString()))].map((id) => new ObjectId(id));
    const tenants =
      tenantIds.length > 0
        ? await db.collection(COLLECTIONS.users).find({ _id: { $in: tenantIds } }, { projection: { name: 1 } }).toArray()
        : [];
    const nameMap = Object.fromEntries(tenants.map((t) => [t._id.toString(), t.name]));

    const enriched = submissions.map((s) => ({
      ...s,
      _id: s._id.toString(),
      taskId: s.taskId.toString(),
      tenantId: s.tenantId.toString(),
      tenantName: nameMap[s.tenantId.toString()] ?? "—",
    }));

    return NextResponse.json({ submissions: enriched });
  } catch (e) {
    console.error("Submissions list error:", e);
    return NextResponse.json({ submissions: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { taskId, tenantId, comment } = (await request.json()) as {
      taskId?: string;
      tenantId?: string;
      comment?: string;
    };

    if (!taskId || !tenantId) {
      return NextResponse.json({ error: "taskId and tenantId required" }, { status: 400 });
    }

    const db = await getDb();

    await db.collection(COLLECTIONS.submissions).insertOne({
      taskId: new ObjectId(taskId),
      tenantId: new ObjectId(tenantId),
      comment: comment ?? "",
      status: "pending",
      createdAt: new Date(),
    });

    // Update task status
    await db.collection(COLLECTIONS.tasks).updateOne(
      { _id: new ObjectId(taskId) },
      { $set: { status: "submitted" } }
    );

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("Submission create error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to submit" },
      { status: 500 }
    );
  }
}
