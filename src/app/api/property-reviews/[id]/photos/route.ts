import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { resolveUser } from "@/lib/api/backendProxy";

const REVIEWS = "property_reviews";

/**
 * POST /api/property-reviews/:id/photos  → landlord uploads photos
 * Since we don't have file storage, we store photo entries with placeholder data URLs.
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

    // Parse the multipart form to count how many files were uploaded
    const formData = await request.formData();
    const files = formData.getAll("files");

    const newPhotos = files.map((_, i) => ({
      url: `/photos/landlord-${params.id}-${Date.now()}-${i}.jpg`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: sessionUser.id,
    }));

    await db.collection(REVIEWS).updateOne(
      { _id: new ObjectId(params.id) },
      {
        $push: { landlordPhotos: { $each: newPhotos } } as Record<string, unknown>,
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json(
      { uploaded: newPhotos.length },
      { status: 200 }
    );
  } catch (e) {
    console.error("Landlord photo upload error:", e);
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
