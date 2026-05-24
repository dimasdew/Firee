import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Email not configured" }, { status: 200 });
  }

  try {
    const body = await req.json();
    const { type, buyerEmail, sellerEmail, productTitle, priceUsdc, txHash } = body;

    if (type !== "purchase") {
      return NextResponse.json({ ok: false, error: "Unknown type" }, { status: 400 });
    }

    const basescanUrl = `https://sepolia.basescan.org/tx/${txHash}`;

    if (buyerEmail) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Firee <noreply@firee.app>",
          to: buyerEmail,
          subject: `Purchase confirmed: ${productTitle}`,
          html: `
            <h2>Purchase Confirmed!</h2>
            <p>You just bought <strong>${productTitle}</strong> for <strong>${priceUsdc} USDC</strong>.</p>
            <p>Go to your <a href="https://mp-firee.vercel.app/order">Orders page</a> to download your file.</p>
            <p><a href="${basescanUrl}">View transaction on BaseScan</a></p>
            <br/>
            <p style="color:#888;font-size:12px">— Firee Marketplace</p>
          `,
        }),
      });
    }

    if (sellerEmail) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Firee <noreply@firee.app>",
          to: sellerEmail,
          subject: `New sale: ${productTitle}`,
          html: `
            <h2>You made a sale!</h2>
            <p>Someone just bought <strong>${productTitle}</strong> for <strong>${priceUsdc} USDC</strong>.</p>
            <p>Your earnings (after 3% fee): <strong>${(priceUsdc * 0.97).toFixed(2)} USDC</strong></p>
            <p>View your <a href="https://mp-firee.vercel.app/seller/analytics">Seller Dashboard</a> for details.</p>
            <p><a href="${basescanUrl}">View transaction on BaseScan</a></p>
            <br/>
            <p style="color:#888;font-size:12px">— Firee Marketplace</p>
          `,
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Notify error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
