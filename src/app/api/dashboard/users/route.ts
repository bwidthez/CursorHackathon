import { NextRequest, NextResponse } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/db/mongodb";
import { hashPassword } from "@/lib/db/hash";

/** GET — list users by role.  POST — create a landlord (admin). */
export async function GET(request: NextRequest) {
  try {
    const role = request.nextUrl.searchParams.get("role") ?? "landlord";
    const db = await getDb();
    const users = await db
      .collection(COLLECTIONS.users)
      .find({ role }, { projection: { passwordHash: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ users });
  } catch (e) {
    console.error("Users list error:", e);
    return NextResponse.json({ users: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }

    const db = await getDb();
    const existing = await db.collection(COLLECTIONS.users).findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }

    const result = await db.collection(COLLECTIONS.users).insertOne({
      name,
      email: email.toLowerCase().trim(),
      passwordHash: hashPassword(password || "password123"),
      role: role === "tenant" ? "tenant" : "landlord",
      landlordId: null,
      status: "active",
      createdAt: new Date(),
    });

    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch (e) {
    console.error("User create error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create user" },
      { status: 500 }
    );
  }
}
