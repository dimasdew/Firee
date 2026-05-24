"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Download, Loader2, ExternalLink } from "lucide-react";
import { createClient } from "../lib/supabase/client";
import { getBuyerOrders, getDownloadUrl } from "../lib/supabase/orders";
import { CHAIN_ID } from "../lib/contracts";
import { useApp } from "../context/AppContext";
import UsdcAmount from "./UsdcAmount";
import type { DbOrder } from "../lib/supabase/types";

export default function PurchasedOrderList() {
  const { showToast } = useApp();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      getBuyerOrders(user.id)
        .then(setOrders)
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, []);

  const handleDownload = async (order: DbOrder) => {
    setDownloadingId(order.id);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { showToast("Please log in"); return; }
      const url = await getDownloadUrl(user.id, order.product_id);
      if (url) {
        window.open(url, "_blank");
      } else {
        showToast("Download not available");
      }
    } catch {
      showToast("Download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <Loader2 size={20} style={{ animation: "spin 1s linear infinite", color: "var(--sky)" }} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="card" style={{ padding: "40px 24px", textAlign: "center" }}>
        <ShoppingBag size={32} color="var(--sky)" style={{ margin: "0 auto 12px", opacity: 0.3 }} />
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text, white)", marginBottom: 6 }}>
          No purchases yet
        </p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
          Buy digital products with USDC to see them here.
        </p>
        <Link href="/dashboard" className="btn-sand">
          Browse Marketplace
        </Link>
      </div>
    );
  }

  return (
    <>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
        {orders.length} purchase{orders.length !== 1 ? "s" : ""}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {orders.map((order) => (
          <article key={order.id} className="card card-lift" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              {/* Thumbnail */}
              <div style={{
                width: 48, height: 48, borderRadius: 8,
                background: "rgba(110,172,218,0.08)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, overflow: "hidden",
              }}>
                {order.product?.thumbnail_url
                  ? <img src={order.product.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <ShoppingBag size={20} color="var(--sky)" style={{ opacity: 0.3 }} />
                }
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 140 }}>
                <Link
                  href={`/product/${order.product_id}`}
                  style={{ fontWeight: 600, fontSize: 14, color: "var(--text, white)", textDecoration: "none" }}
                >
                  {order.product?.title || "Product"}
                </Link>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </p>
              </div>

              {/* Price + Actions */}
              <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <UsdcAmount
                  value={order.price_usdc}
                  iconSize={13}
                  style={{ fontSize: 14, fontWeight: 700, color: "var(--sand)" }}
                />
                <div style={{ display: "flex", gap: 6 }}>
                  {order.tx_hash && (
                    <a
                      href={`https://${CHAIN_ID === 8453 ? "" : "sepolia."}basescan.org/tx/${order.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon-btn"
                      style={{ width: 28, height: 28 }}
                      title="View transaction"
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                  <button
                    type="button"
                    className="btn-sand"
                    onClick={() => handleDownload(order)}
                    disabled={downloadingId === order.id}
                    style={{ padding: "4px 12px", fontSize: 11, gap: 4 }}
                  >
                    {downloadingId === order.id
                      ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} />
                      : <Download size={11} />
                    }
                    Download
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
