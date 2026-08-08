import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Midtrans Payment Notification Webhook (idempotent)
 *
 * order_id format: PRO-{userId}-{timestamp}
 * Resolves user_id from payment_transactions table (not string parsing).
 * Uses payment_transactions table to prevent double-processing.
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

    /* ---- 2. Determine outcome ---- */
    const isSuccess =
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept");

    const isFailure =
      transaction_status === "deny" ||
      transaction_status === "cancel" ||
      transaction_status === "expire";

    if (!isSuccess && !isFailure) {
      console.log("[Midtrans Webhook] Transaction pending:", order_id, transaction_status);
      return NextResponse.json({ status: "OK" }, { status: 200 });
    }

    /* ---- 3. Get DB client ---- */
    const admin = createSupabaseAdminClient();
    if (!admin) {
      console.error("[Midtrans Webhook] Supabase admin client unavailable");
      return NextResponse.json({ status: "OK" }, { status: 200 });
    }

    /* ---- 4. Single query: lookup existing row + get user_id ---- */
    const effectiveStatus = isSuccess ? "settlement" : transaction_status;

    const { data: txRow, error: checkErr } = await admin
      .from("payment_transactions")
      .select("order_id, user_id, transaction_status")
      .eq("order_id", order_id)
      .maybeSingle();

    if (checkErr) {
      console.error(
        "[Midtrans Webhook] Failed to query payment_transactions (table may not exist):",
        checkErr.message,
        checkErr.code,
        checkErr.details
      );
      return NextResponse.json(
        { error: "Internal DB error", detail: "payment_transactions query failed" },
        { status: 500 }
      );
    }

    /* ---- 5. Resolve userId from DB row ---- */
    const userId = txRow?.user_id ?? null;

    if (!userId) {
      console.warn(
        "[Midtrans Webhook] No payment_transactions row found for order_id:",
        order_id,
        "— skipping. Row may not have been inserted by create-transaction."
      );
      return NextResponse.json({ status: "OK" }, { status: 200 });
    }

    // Already processed this exact status → skip, return 200 OK
    if (txRow && txRow.transaction_status === effectiveStatus) {
      console.log("[Midtrans Webhook] Duplicate skip (already processed):", order_id, effectiveStatus);
      return NextResponse.json({ status: "OK" }, { status: 200 });
    }

    /* ---- 6. Upsert payment_transactions (race-condition safe) ---- */
    const { error: upsertErr } = await admin
      .from("payment_transactions")
      .upsert(
        {
          order_id,
          user_id: userId,
          transaction_status: effectiveStatus,
          gross_amount: Number(gross_amount) || 0,
          processed_at: new Date().toISOString(),
        },
        { onConflict: "order_id" }
      );

    if (upsertErr) {
      console.error("[Midtrans Webhook] Upsert error:", upsertErr);
      return NextResponse.json({ status: "OK" }, { status: 200 });
    }

    /* ---- 7. Update profiles if success ---- */
    if (isSuccess) {
      const { data: profile } = await admin
        .from("profiles")
        .select("pro_expiry_date")
        .eq("id", userId)
        .single();

      const now = new Date();
      const currentExpiry = profile?.pro_expiry_date
        ? new Date(profile.pro_expiry_date as string)
        : null;

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
        console.log("[Midtrans Webhook] Pro activated for user:", userId, "expiry:", newExpiry);
      }
    }

    if (isFailure) {
      console.log("[Midtrans Webhook] Payment failed for user:", userId, "status:", transaction_status);
    }

    return NextResponse.json({ status: "OK" }, { status: 200 });
  } catch (err) {
    console.error("[Midtrans Webhook] Unhandled error:", err);
    return NextResponse.json({ status: "OK" }, { status: 200 });
  }
}
