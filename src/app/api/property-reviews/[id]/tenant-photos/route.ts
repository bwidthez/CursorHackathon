import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { resolveUser } from "@/lib/api/backendProxy";

const REVIEWS = "property_reviews";

/**
 * POST /api/property-reviews/:id/tenant-photos  → tenant uploads photos
 */
export async function POST(
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
      return NextResponse.json({ detail: "Review not found" }, { status: 404 });
    }

    // Parse multipart form
    const formData = await request.formData();
    const files = formData.getAll("files");

    const newPhotos = files.map((_, i) => ({
      url: `/photos/tenant-${params.id}-${Date.now()}-${i}.jpg`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: sessionUser.id,
    }));

    await db.collection(REVIEWS).updateOne(
      { _id: new ObjectId(params.id) },
      {
        $push: { tenantPhotos: { $each: newPhotos } } as Record<string, unknown>,
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json(
      { uploaded: newPhotos.length },
      { status: 200 }
    );
  } catch (e) {
    console.error("Tenant photo upload error:", e);
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
