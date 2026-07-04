"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../../../components/Navbar";
import MobileBottomNav from "../../../components/MobileBottomNav";
import AuthGuard from "../../../components/AuthGuard";
import UsdcAmount from "../../../components/UsdcAmount";
import { createClient } from "../../../lib/supabase/client";
import { getDownloadUrl } from "../../../lib/supabase/orders";
import { CHAIN_ID } from "../../../lib/contracts";
import { ArrowLeft, Download, ExternalLink, Loader2, ShoppingBag, CheckCircle } from "lucide-react";
import type { DbOrder } from "../../../lib/supabase/types";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<DbOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      const { data, error } = await supabase
        .from("orders")
        .select("*, product:products(id, title, short_description, thumbnail_url, file_url, file_name)")
        .eq("id", orderId)
        .eq("buyer_id", user.id) // buyer-only access
        .single();
      if (error || !data) {
        router.replace("/order");
        return;
      }
      setOrder(data);
      setLoading(false);
    });
  }, [orderId, router]);

  const handleDownload = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const url = await getDownloadUrl(user.id, order.product_id);
      if (url) {
        const a = document.createElement("a");
        a.href = url;
        a.download = (order.product as any)?.file_name || "download";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } finally {
      setDownloading(false);
    }
  };

  const basescanBase = CHAIN_ID === 8453 ? "https://basescan.org" : "https://sepolia.basescan.org";

  return (
    <AuthGuard>
      <div className="page-shell">
        <Navbar variant="dashboard" />
        <main className="container" style={{ padding: "28px 0 48px", maxWidth: 600 }}>
          <Link
            href="/order"
            className="btn-ghost"
            style={{ fontSize: 12, marginBottom: 20, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <ArrowLeft size={13} /> Back to Orders
          </Link>

          {loading ? (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "var(--sky)" }} />
            </div>
          ) : !order ? null : (
            <div className="card" style={{ padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <CheckCircle size={18} color="#4ade80" />
                <span style={{ fontSize: 14, fontWeight: 700, color: "#4ade80" }}>Purchase Confirmed</span>
              </div>

              {/* Product */}
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20 }}>
                <div style={{
                  position: "relative", width: 64, height: 64, borderRadius: 10,
                  background: "rgba(110,172,218,0.08)", border: "1px solid var(--border)",
                  overflow: "hidden", flexShrink: 0,
                }}>
                  {(order.product as any)?.thumbnail_url
                    ? <Image src={(order.product as any).thumbnail_url} alt="" fill sizes="64px" style={{ objectFit: "cover" }} />
                    : <ShoppingBag size={24} color="var(--sky)" style={{ position: "absolute", inset: 0, margin: "auto", opacity: 0.3 }} />
                  }
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)" }}>
                    {(order.product as any)?.title || "Product"}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    {(order.product as any)?.short_description}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div style={{ fontSize: 13, marginBottom: 24 }}>
                {[
                  ["Order ID", order.id],
                  ["Date", new Date(order.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })],
                  ["Amount", null], // rendered separately
                  ["Status", order.status],
                ].map(([label, val]) => (
                  <div key={label as string} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, gap: 12 }}>
                    <span style={{ color: "var(--text-muted)" }}>{label}</span>
                    {label === "Amount"
                      ? <UsdcAmount value={order.price_usdc} iconSize={12} style={{ fontSize: 13, fontWeight: 700, color: "var(--sand)" }} />
                      : <span className={label === "Order ID" ? "mono" : ""} style={{ color: "var(--text, white)", textAlign: "right", wordBreak: "break-all" }}>{val}</span>
                    }
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn-sand"
                  onClick={handleDownload}
                  disabled={downloading}
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  {downloading
                    ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                    : <Download size={14} />
                  }
                  Download File
                </button>
                {order.tx_hash && (
                  <a
                    href={`${basescanBase}/tx/${order.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost"
                    style={{ fontSize: 12, textDecoration: "none" }}
                  >
                    <ExternalLink size={13} /> Transaction
                  </a>
                )}
              </div>
            </div>
          )}
        </main>
        <MobileBottomNav />
      </div>
    </AuthGuard>
  );
}
