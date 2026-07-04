import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "../../../lib/supabase/server";
import { isRateLimited } from "../../../lib/rate-limit";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (isRateLimited(`notify:${user.id}`, 5, 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Email not configured" }, { status: 200 });
  }

  try {
    const body = await req.json();
    const { type, orderId } = body;

    if (type !== "purchase" || !orderId) {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }

    // C8: Resolve all email/product data from DB — never trust client-supplied emails
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select(`
        id,
        price_usdc,
        tx_hash,
        buyer_id,
        buyer:profiles!orders_buyer_id_fkey(email),
        seller_id,
        seller:profiles!orders_seller_id_fkey(email),
        product:products(title)
      `)
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    // Only the buyer or seller of this order can trigger its notification
    if (order.buyer_id !== user.id && order.seller_id !== user.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
    }

    const buyerEmail = (order.buyer as any)?.email as string | undefined;
    const sellerEmail = (order.seller as any)?.email as string | undefined;
    const productTitle = (order.product as any)?.title as string | undefined;
    const priceUsdc = order.price_usdc;
    const txHash = order.tx_hash;
    const basescanUrl = `https://sepolia.basescan.org/tx/${txHash}`;

    const sendEmail = async (to: string, subject: string, html: string) => {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: "Firee <noreply@firee.app>", to, subject, html }),
      });
    };

    if (buyerEmail) {
      await sendEmail(
        buyerEmail,
        `Purchase confirmed: ${productTitle}`,
        `<h2>Purchase Confirmed!</h2>
         <p>You just bought <strong>${productTitle}</strong> for <strong>${priceUsdc} USDC</strong>.</p>
         <p>Go to your <a href="https://mp-firee.vercel.app/order">Orders page</a> to download your file.</p>
         <p><a href="${basescanUrl}">View transaction on BaseScan</a></p>
         <p style="color:#888;font-size:12px">— Firee Marketplace</p>`
      );
    }

    if (sellerEmail) {
      await sendEmail(
        sellerEmail,
        `New sale: ${productTitle}`,
        `<h2>You made a sale!</h2>
         <p>Someone just bought <strong>${productTitle}</strong> for <strong>${priceUsdc} USDC</strong>.</p>
         <p>Your earnings (after 3% fee): <strong>${(Number(priceUsdc) * 0.97).toFixed(2)} USDC</strong></p>
         <p>View your <a href="https://mp-firee.vercel.app/seller/analytics">Seller Dashboard</a> for details.</p>
         <p><a href="${basescanUrl}">View transaction on BaseScan</a></p>
         <p style="color:#888;font-size:12px">— Firee Marketplace</p>`
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Notify error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
