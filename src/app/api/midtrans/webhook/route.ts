import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Midtrans Payment Notification Webhook
 *
 * order_id format: PRO-{userId} (e.g. PRO-abc123def456)
 * On successful payment, sets profiles.is_pro = true and
 * extends pro_expiry_date by 30 days from now.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
      signature_key,
    } = body as {
      order_id: string;
      transaction_status: string;
      fraud_status?: string;
      status_code: string;
      gross_amount: string;
      signature_key: string;
    };

    /* ---- 1. Signature verification ---- */
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error("[Midtrans Webhook] MIDTRANS_SERVER_KEY not set");
      return NextResponse.json({ status: "OK" }, { status: 200 });
    }

    const hash = crypto
      .createHash("sha512")
      .update(order_id + status_code + gross_amount + serverKey)
      .digest("hex");

    if (hash !== signature_key) {
      console.warn("[Midtrans Webhook] Invalid signature for order_id:", order_id);
      return NextResponse.json({ message: "Invalid Signature" }, { status: 400 });
    }

    /* ---- 2. Parse order_id → userId ---- */
    // Expected format: PRO-{userId}
    const userId = order_id.startsWith("PRO-") ? order_id.slice(4) : null;
    if (!userId) {
      console.warn("[Midtrans Webhook] Unrecognized order_id format:", order_id);
      return NextResponse.json({ status: "OK" }, { status: 200 });
    }

    /* ---- 3. Determine outcome ---- */
    const isSuccess =
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept");

    const isFailure =
      transaction_status === "deny" ||
      transaction_status === "cancel" ||
      transaction_status === "expire";

    if (!isSuccess && !isFailure) {
      // Pending / challenge — nothing to do yet
      console.log("[Midtrans Webhook] Transaction pending:", order_id, transaction_status);
      return NextResponse.json({ status: "OK" }, { status: 200 });
    }

    /* ---- 4. Update database ---- */
    const admin = createSupabaseAdminClient();
    if (!admin) {
      console.error("[Midtrans Webhook] Supabase admin client unavailable");
      return NextResponse.json({ status: "OK" }, { status: 200 });
    }

    if (isSuccess) {
      // Fetch current profile to preserve existing expiry if still valid
      const { data: profile } = await admin
        .from("profiles")
        .select("pro_expiry_date")
        .eq("id", userId)
        .single();

      const now = new Date();
      const currentExpiry = profile?.pro_expiry_date
        ? new Date(profile.pro_expiry_date as string)
        : null;

      // If existing Pro hasn't expired, extend from that date; otherwise from now
      const baseDate =
        currentExpiry && currentExpiry.getTime() > now.getTime()
          ? currentExpiry
          : now;
      const newExpiry = new Date(
        baseDate.getTime() + 30 * 24 * 60 * 60 * 1000
      ).toISOString();

      const { error } = await admin
        .from("profiles")
        .update({ is_pro: true, pro_expiry_date: newExpiry })
        .eq("id", userId);

      if (error) {
        console.error("[Midtrans Webhook] DB update error:", error);
      } else {
        console.log(
          "[Midtrans Webhook] Pro activated for user:",
          userId,
          "expiry:",
          newExpiry
        );
      }
    }

    if (isFailure) {
      console.log(
        "[Midtrans Webhook] Payment failed for user:",
        userId,
        "status:",
        transaction_status
      );
      // No DB change needed — is_pro stays as-is (was never set to true)
    }

    /* ---- 5. Always return 200 to Midtrans ---- */
    return NextResponse.json({ status: "OK" }, { status: 200 });
  } catch (err) {
    console.error("[Midtrans Webhook] Unhandled error:", err);
    return NextResponse.json({ status: "OK" }, { status: 200 });
  }
}
