import { NextResponse } from "next/server";
import { authenticateRequest, withCookies } from "@/lib/auth-helper";

export const runtime = "nodejs";

const PRO_PRICE = 29000; // Rp 29.000 / bulan

/**
 * Create a Midtrans Snap transaction for Pro upgrade.
 * Returns { snap_token, redirect_url } to open the Snap payment popup.
 */
export async function POST() {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) return auth.error;
    const { user, res } = auth;

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return withCookies(res, { error: "Pembayaran belum tersedia" }, 503);
    }

    const isProduction = !serverKey.startsWith("SB-");
    const baseUrl = isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    const order_id = `PRO-${user.id}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pesanlagi.web.id";

    const payload = {
      transaction_details: {
        order_id,
        gross_amount: PRO_PRICE,
      },
      item_details: [
        {
          id: "pesanlagi-pro-30d",
          price: PRO_PRICE,
          quantity: 1,
          name: "PesanLagi Pro — 30 Hari",
        },
      ],
      customer_details: {
        email: user.email,
        user_id: user.id,
      },
      callbacks: {
        finish: `${appUrl}/?payment=success`,
        error: `${appUrl}/?payment=error`,
        pending: `${appUrl}/?payment=pending`,
      },
    };

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Basic " + Buffer.from(serverKey + ":").toString("base64"),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Midtrans API error:", response.status, errBody);
      return withCookies(res, { error: "Gagal membuat transaksi" }, 500);
    }

    const data = await response.json();
    // data = { token: "snap_token", redirect_url: "..." }

    return withCookies(res, {
      snap_token: data.token,
      redirect_url: data.redirect_url,
    });
  } catch (err) {
    console.error("Create transaction error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
