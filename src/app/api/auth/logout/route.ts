import { NextRequest, NextResponse } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/db/mongodb";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("rentshield_token")?.value;
    if (token) {
      const db = await getDb();
      await db.collection(COLLECTIONS.sessions).deleteOne({ token });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set("rentshield_token", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (e) {
    console.error("Logout error:", e);
    return NextResponse.json({ ok: true });
  }
}
