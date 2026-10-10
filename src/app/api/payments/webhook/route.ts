import { NextResponse } from "next/server";

/**
 * Webhook placeholder. Do not update payment_records until the provider signature,
 * event type, amount, currency, order, and idempotency have been verified.
 */
export async function POST() {
 if (!process.env.PAYMENT_WEBHOOK_SECRET) {
  return NextResponse.json({ error: "Payment webhook is not configured." }, { status: 503 });
 }
 return NextResponse.json({ error: "Webhook signature verification and event handling must be implemented before production use." }, { status: 501 });
}
