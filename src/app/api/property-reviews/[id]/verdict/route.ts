import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { resolveUser } from "@/lib/api/backendProxy";
import crypto from "crypto";

const REVIEWS = "property_reviews";
const VOUCHERS = "vouchers";

const VOUCHER_LABELS: Record<string, string> = {
  amazon_10: "Amazon £10",
  cinema_10: "Cinema £10",
  coffee_5: "Coffee £5",
};

function generateVoucherCode(): string {
  return crypto.randomBytes(8).toString("hex").toUpperCase(); // 16 chars
}

/**
 * POST /api/property-reviews/:id/verdict
 * Body: { verdict: "thumbs_up" | "thumbs_down", voucherType?: string }
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
    if (sessionUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { verdict, voucherType } = body as {
      verdict?: string;
      voucherType?: string;
    };

    if (!verdict || !["thumbs_up", "thumbs_down"].includes(verdict)) {
      return NextResponse.json(
        { detail: "verdict must be 'thumbs_up' or 'thumbs_down'" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const review = await db
      .collection(REVIEWS)
      .findOne({ _id: new ObjectId(params.id) });

    if (!review) {
      return NextResponse.json({ detail: "Review not found" }, { status: 404 });
    }

    const newStatus = verdict === "thumbs_up" ? "approved" : "rejected";
    let voucherId: ObjectId | null = null;

    // If approved and a voucher type is selected, issue a voucher
    if (verdict === "thumbs_up" && voucherType) {
      const voucherDoc = {
        tenantId: review.tenantId,
        propertyReviewId: review._id,
        voucherType,
        voucherTypeLabel: VOUCHER_LABELS[voucherType] ?? voucherType,
        voucherCode: generateVoucherCode(),
        issuedById: new ObjectId(sessionUser.id),
        issuedAt: new Date(),
        status: "active",
      };
      const vResult = await db.collection(VOUCHERS).insertOne(voucherDoc);
      voucherId = vResult.insertedId;
    }

    await db.collection(REVIEWS).updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          status: newStatus,
          adminVerdict: verdict,
          ...(voucherId ? { voucherId } : {}),
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      status: newStatus,
      adminVerdict: verdict,
      voucherId: voucherId?.toString() ?? null,
    });
  } catch (e) {
    console.error("Review verdict error:", e);
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
