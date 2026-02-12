import { NextRequest, NextResponse } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

/** GET a single task by id. */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const task = await db.collection(COLLECTIONS.tasks).findOne({ _id: new ObjectId(params.id) });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Get tenant + landlord names
    const userIds = [task.landlordId, task.tenantId].filter(Boolean).map((id) => new ObjectId(id));
    const users = await db.collection(COLLECTIONS.users).find({ _id: { $in: userIds } }, { projection: { name: 1 } }).toArray();
    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u.name]));

    return NextResponse.json({
      task: {
        ...task,
        _id: task._id.toString(),
        landlordId: task.landlordId?.toString(),
        tenantId: task.tenantId?.toString(),
        propertyId: task.propertyId?.toString(),
        landlordName: userMap[task.landlordId?.toString()] ?? "—",
        tenantName: userMap[task.tenantId?.toString()] ?? "—",
      },
    });
  } catch (e) {
    console.error("Task get error:", e);
    return NextResponse.json({ error: "Failed to get task" }, { status: 500 });
  }
}
