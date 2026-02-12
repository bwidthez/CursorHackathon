import { NextRequest, NextResponse } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

/** GET — list tasks for a user.  POST — create a task (landlord). */
export async function GET(request: NextRequest) {
  try {
    const role = request.nextUrl.searchParams.get("role");
    const userId = request.nextUrl.searchParams.get("userId");

    const db = await getDb();
    const filter: Record<string, unknown> = {};

    if (role === "landlord" && userId) {
      filter.landlordId = new ObjectId(userId);
    } else if (role === "tenant" && userId) {
      filter.tenantId = new ObjectId(userId);
    }

    const tasks = await db
      .collection(COLLECTIONS.tasks)
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    // Enrich with tenant/landlord names
    const userIds = [
      ...new Set(tasks.flatMap((t) => [t.landlordId?.toString(), t.tenantId?.toString()].filter(Boolean))),
    ].map((id) => new ObjectId(id));

    const users = userIds.length > 0
      ? await db.collection(COLLECTIONS.users).find({ _id: { $in: userIds } }, { projection: { name: 1, email: 1 } }).toArray()
      : [];

    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

    const enriched = tasks.map((t) => ({
      ...t,
      _id: t._id.toString(),
      landlordId: t.landlordId?.toString(),
      tenantId: t.tenantId?.toString(),
      propertyId: t.propertyId?.toString(),
      landlordName: userMap[t.landlordId?.toString()]?.name ?? "—",
      tenantName: userMap[t.tenantId?.toString()]?.name ?? "—",
    }));

    return NextResponse.json({ tasks: enriched });
  } catch (e) {
    console.error("Tasks list error:", e);
    return NextResponse.json({ tasks: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { landlordId, tenantId, propertyId, title, description, rewardAmount, deadline } = body as {
      landlordId?: string;
      tenantId?: string;
      propertyId?: string;
      title?: string;
      description?: string;
      rewardAmount?: number;
      deadline?: string;
    };

    if (!landlordId || !title) {
      return NextResponse.json({ error: "landlordId and title are required" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection(COLLECTIONS.tasks).insertOne({
      landlordId: new ObjectId(landlordId),
      tenantId: tenantId ? new ObjectId(tenantId) : null,
      propertyId: propertyId ? new ObjectId(propertyId) : null,
      title,
      description: description ?? "",
      rewardAmount: rewardAmount ?? 0,
      deadline: deadline ? new Date(deadline) : new Date(Date.now() + 14 * 86400000),
      status: "open",
      createdAt: new Date(),
    });

    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch (e) {
    console.error("Task create error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create task" },
      { status: 500 }
    );
  }
}
