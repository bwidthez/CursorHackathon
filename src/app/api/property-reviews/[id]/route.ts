import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { resolveUser } from "@/lib/api/backendProxy";

const REVIEWS = "property_reviews";

/**
 * GET /api/property-reviews/:id  → get one review
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await resolveUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const review = await db
      .collection(REVIEWS)
      .findOne({ _id: new ObjectId(params.id) });

    if (!review) {
      return NextResponse.json({ detail: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: review._id.toString(),
      tenantId: review.tenantId?.toString() ?? "",
      landlordId: review.landlordId?.toString() ?? "",
      status: review.status ?? "pending_admin_review",
      landlordNote: review.landlordNote ?? null,
      landlordPhotos: review.landlordPhotos ?? [],
      tenantPhotos: review.tenantPhotos ?? [],
      adminVerdict: review.adminVerdict ?? null,
      voucherId: review.voucherId?.toString() ?? null,
      createdAt: review.createdAt?.toISOString?.() ?? new Date().toISOString(),
    });
  } catch (e) {
    console.error("Property review detail error:", e);
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
