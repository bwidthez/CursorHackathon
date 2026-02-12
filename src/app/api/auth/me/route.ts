import { NextRequest, NextResponse } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("rentshield_token")?.value;
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const db = await getDb();
    const session = await db.collection(COLLECTIONS.sessions).findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await db
      .collection(COLLECTIONS.users)
      .findOne({ _id: new ObjectId(session.userId) });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        landlordId: user.landlordId?.toString() ?? null,
      },
    });
  } catch (e) {
    console.error("Auth/me error:", e);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
