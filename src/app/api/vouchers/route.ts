import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { resolveUser } from "@/lib/api/backendProxy";

const VOUCHERS = "vouchers";

/**
 * GET /api/vouchers → list vouchers
 * - Admin sees all
 * - Tenant sees own
 * - Landlord sees none (empty)
 */
export async function GET(request: NextRequest) {
  try {
    const sessionUser = await resolveUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const filter: Record<string, unknown> = {};

    if (sessionUser.role === "tenant") {
      filter.tenantId = new ObjectId(sessionUser.id);
    } else if (sessionUser.role === "landlord") {
      // Landlords don't see vouchers
      return NextResponse.json([]);
    }
    // admin sees all → no filter

    const vouchers = await db
      .collection(VOUCHERS)
      .find(filter)
      .sort({ issuedAt: -1 })
      .toArray();

    const result = vouchers.map((v) => ({
      id: v._id.toString(),
      tenantId: v.tenantId?.toString() ?? "",
      propertyReviewId: v.propertyReviewId?.toString() ?? "",
      voucherType: v.voucherType ?? "",
      voucherCode: v.voucherCode ?? "",
      voucherTypeLabel: v.voucherTypeLabel ?? v.voucherType ?? "",
      issuedById: v.issuedById?.toString() ?? "",
      issuedAt: v.issuedAt?.toISOString?.() ?? new Date().toISOString(),
      status: v.status ?? "active",
    }));

    return NextResponse.json(result);
  } catch (e) {
    console.error("Vouchers list error:", e);
    return NextResponse.json([], { status: 200 });
  }
}
