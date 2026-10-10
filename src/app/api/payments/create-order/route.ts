import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Payment provider integration scaffold.
 * This endpoint deliberately refuses to create orders until a real provider flow is implemented.
 * Never mark a payment paid based on browser input. Verify signed provider webhooks server-side.
 */
export async function POST() {
 const supabase = await createClient();
 const { data: { user }, error } = await supabase.auth.getUser();
 if (error || !user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
 if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  return NextResponse.json({ error: "Payments are not configured. Add provider credentials and implement order creation plus webhook verification before accepting money." }, { status: 503 });
 }
 return NextResponse.json({ error: "Provider credentials exist, but order creation is intentionally not implemented in this starter. Complete and test the provider integration before enabling payments." }, { status: 501 });
}
