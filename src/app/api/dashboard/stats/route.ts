import { NextRequest, NextResponse } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/db/mongodb";

/** Admin dashboard stats. */
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const [landlords, tenants, openTasks] = await Promise.all([
      db.collection(COLLECTIONS.users).countDocuments({ role: "landlord" }),
      db.collection(COLLECTIONS.users).countDocuments({ role: "tenant" }),
      db.collection(COLLECTIONS.tasks).countDocuments({ status: "open" }),
    ]);
    return NextResponse.json({ landlords, tenants, openTasks });
  } catch (e) {
    console.error("Stats error:", e);
    return NextResponse.json({ landlords: 0, tenants: 0, openTasks: 0 });
  }
}
