import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { resolveUser } from "@/lib/api/backendProxy";

const REVIEWS = "property_reviews";

/**
 * GET  /api/property-reviews  → list reviews (filtered by role)
 * POST /api/property-reviews  → create review (landlord)
 */
export async function GET(request: NextRequest) {
  try {
    const sessionUser = await resolveUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const filter: Record<string, unknown> = {};

    // Landlords see their own reviews, tenants see reviews for them, admin sees all
    if (sessionUser.role === "landlord") {
      filter.landlordId = new ObjectId(sessionUser.id);
    } else if (sessionUser.role === "tenant") {
      filter.tenantId = new ObjectId(sessionUser.id);
    }

    const reviews = await db
      .collection(REVIEWS)
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    const result = reviews.map((r) => ({
      id: r._id.toString(),
      tenantId: r.tenantId?.toString() ?? "",
      landlordId: r.landlordId?.toString() ?? "",
      status: r.status ?? "pending_admin_review",
      landlordNote: r.landlordNote ?? null,
      landlordPhotos: r.landlordPhotos ?? [],
      tenantPhotos: r.tenantPhotos ?? [],
      adminVerdict: r.adminVerdict ?? null,
      voucherId: r.voucherId?.toString() ?? null,
      createdAt: r.createdAt?.toISOString?.() ?? new Date().toISOString(),
    }));

    return NextResponse.json(result);
  } catch (e) {
    console.error("Property reviews list error:", e);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await resolveUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tenantId, landlordNote } = body as {
      tenantId?: string;
      landlordNote?: string | null;
    };

    if (!tenantId) {
      return NextResponse.json(
        { detail: "tenantId is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection(REVIEWS).insertOne({
      tenantId: new ObjectId(tenantId),
      landlordId: new ObjectId(sessionUser.id),
      landlordNote: landlordNote ?? null,
      landlordPhotos: [],
      tenantPhotos: [],
      status: "pending_admin_review",
      adminVerdict: null,
      voucherId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { propertyReviewId: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (e) {
    console.error("Property review create error:", e);
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Failed to create review" },
      { status: 500 }
    );
  }
}
