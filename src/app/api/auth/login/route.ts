import { NextResponse } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/db/mongodb";
import { verifyPassword, generateToken } from "@/lib/db/hash";

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const db = await getDb();
    const user = await db.collection(COLLECTIONS.users).findOne({ email: email.toLowerCase().trim() });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (user.status === "suspended") {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.collection(COLLECTIONS.sessions).insertOne({
      userId: user._id,
      role: user.role,
      token,
      expiresAt,
      createdAt: new Date(),
    });

    const response = NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("rentshield_token", token, {
      httpOnly: true,
      secure: false, // set true in production
      sameSite: "lax",
      path: "/",
      maxAge: 86400,
    });

    return response;
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Login failed" },
      { status: 500 }
    );
  }
}
