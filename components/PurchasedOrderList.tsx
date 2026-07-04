"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Download, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { createClient } from "../lib/supabase/client";
import { getBuyerOrders, getDownloadUrl } from "../lib/supabase/orders";
import { createDispute, getDisputeByOrder } from "../lib/supabase/disputes";
import { CHAIN_ID } from "../lib/contracts";
import { useApp } from "../context/AppContext";
import UsdcAmount from "./UsdcAmount";
import type { DbOrder } from "../lib/supabase/types";

export default function PurchasedOrderList() {
  const { showToast } = useApp();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [disputes, setDisputes] = useState<Record<string, string>>({}); // orderId -> status
  const [refundReason, setRefundReason] = useState("");
  const [showRefundModal, setShowRefundModal] = useState<string | null>(null); // orderId
  const [submittingRefund, setSubmittingRefund] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      getBuyerOrders(user.id)
        .then(async (orders) => {
          setOrders(orders);
          // Check dispute status for each order
          const disputeMap: Record<string, string> = {};
          await Promise.all(
            orders.map(async (o) => {
              const d = await getDisputeByOrder(o.id);
              if (d) disputeMap[o.id] = d.status;
            })
          );
          setDisputes(disputeMap);
        })
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
        // M12: use programmatic anchor to bypass popup blocker
        const a = document.createElement("a");
        a.href = url;
        a.download = (order.product as any)?.file_name || "download";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
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
                position: "relative", width: 48, height: 48, borderRadius: 8,
                background: "rgba(110,172,218,0.08)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, overflow: "hidden",
              }}>
                {order.product?.thumbnail_url
                  ? <Image src={order.product.thumbnail_url} alt="" fill sizes="48px" style={{ objectFit: "cover" }} />
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
                  {!disputes[order.id] ? (
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => { setShowRefundModal(order.id); setRefundReason(""); }}
                      style={{ padding: "4px 10px", fontSize: 10, color: "#f87171", borderColor: "rgba(248,113,113,0.2)" }}
                    >
                      Refund
                    </button>
                  ) : (
                    <span className={`badge ${disputes[order.id] === "pending" ? "badge-sand" : disputes[order.id] === "approved" ? "badge-green" : "badge-sky"}`} style={{ fontSize: 9 }}>
                      {disputes[order.id] === "pending" ? "Dispute Pending" : disputes[order.id] === "approved" ? "Refunded" : "Denied"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Refund Request Modal */}
      {showRefundModal && (
        <div className="modal-overlay" onClick={() => setShowRefundModal(null)}>
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ padding: 28, maxWidth: 420, width: "90%", margin: "auto" }}>
            <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 18, color: "var(--text, white)", marginBottom: 8 }}>
              <AlertCircle size={16} color="#f87171" style={{ marginRight: 8, verticalAlign: "middle" }} />
              Request Refund
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.6 }}>
              Describe why you want a refund. Our team will review your request within 48 hours.
            </p>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Reason for refund..."
              rows={4}
              style={{
                width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 8,
                border: "1px solid var(--border)", background: "rgba(0,0,0,0.3)",
                color: "var(--text, white)", resize: "vertical", marginBottom: 20,
              }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" className="btn-ghost" onClick={() => setShowRefundModal(null)} style={{ fontSize: 12 }}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={submittingRefund || !refundReason.trim()}
                onClick={async () => {
                  setSubmittingRefund(true);
                  try {
                    const order = orders.find((o) => o.id === showRefundModal);
                    if (!order) return;
                    const supabase = createClient();
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) { showToast("Please log in"); return; }
                    await createDispute(order.id, user.id, order.seller_id, refundReason);
                    setDisputes((prev) => ({ ...prev, [order.id]: "pending" }));
                    setShowRefundModal(null);
                    showToast("Refund request submitted");
                  } catch {
                    showToast("Failed to submit request");
                  } finally {
                    setSubmittingRefund(false);
                  }
                }}
                style={{ fontSize: 12, background: "#ef4444", borderColor: "#ef4444" }}
              >
                {submittingRefund ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <AlertCircle size={13} />}
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
