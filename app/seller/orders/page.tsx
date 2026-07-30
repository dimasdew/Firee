"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Package, Loader2, Truck, MapPin } from "lucide-react";
import { createClient } from "../../../lib/supabase/client";
import { getSellerOrders, markOrderShipped } from "../../../lib/supabase/orders";
import { useApp } from "../../../context/AppContext";
import UsdcAmount from "../../../components/UsdcAmount";
import type { DbOrder } from "../../../lib/supabase/types";

export default function SellerOrdersPage() {
  const { showToast } = useApp();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [shipModal, setShipModal] = useState<string | null>(null); // orderId
  const [tracking, setTracking] = useState("");
  const [carrier, setCarrier] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      getSellerOrders(user.id)
        .then(setOrders)
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, []);

  const handleShip = async () => {
    if (!shipModal || !tracking.trim()) return;
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { showToast("Please log in"); return; }
      await markOrderShipped(user.id, shipModal, tracking.trim(), carrier.trim() || undefined);
      setOrders((prev) => prev.map((o) => o.id === shipModal
        ? { ...o, status: "shipped", tracking_number: tracking.trim(), shipping_carrier: carrier.trim() || null }
        : o
      ));
      setShipModal(null);
      setTracking("");
      setCarrier("");
      showToast("Order marked as shipped");
    } catch {
      showToast("Failed to update order");
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "paid": return <span className="badge badge-sand" style={{ fontSize: 9 }}>To Ship</span>;
      case "shipped": return <span className="badge badge-sky" style={{ fontSize: 9 }}>Shipped</span>;
      case "delivered":
      case "completed": return <span className="badge badge-green" style={{ fontSize: 9 }}>Delivered</span>;
      case "refunded": return <span className="badge badge-sky" style={{ fontSize: 9 }}>Refunded</span>;
      case "disputed": return <span className="badge badge-sand" style={{ fontSize: 9 }}>Disputed</span>;
      default: return <span className="badge badge-sky" style={{ fontSize: 9 }}>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <Loader2 size={24} color="var(--sky)" style={{ margin: "0 auto", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="card" style={{ padding: "40px 24px", textAlign: "center" }}>
        <Package size={32} color="var(--sky)" style={{ margin: "0 auto 12px", opacity: 0.3 }} />
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text, white)", marginBottom: 6 }}>No orders yet</p>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Orders from buyers will show up here.</p>
      </div>
    );
  }

  return (
    <>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
        {orders.length} order{orders.length !== 1 ? "s" : ""}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {orders.map((order) => (
          <article key={order.id} className="card" style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{
                position: "relative", width: 48, height: 48, borderRadius: 8,
                background: "rgba(110,172,218,0.08)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, overflow: "hidden",
              }}>
                {order.product?.thumbnail_url
                  ? <Image src={order.product.thumbnail_url} alt="" fill sizes="48px" style={{ objectFit: "cover" }} />
                  : <Package size={20} color="var(--sky)" style={{ opacity: 0.3 }} />
                }
              </div>

              <div style={{ flex: 1, minWidth: 140 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text, white)" }}>
                  {order.product?.title || "Product"}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  {order.buyer?.display_name || order.buyer?.username || "Buyer"} · {new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </p>
                <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {statusBadge(order.status)}
                  {order.tracking_number && (
                    <span className="mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>
                      {order.shipping_carrier ? `${order.shipping_carrier}: ` : ""}{order.tracking_number}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <UsdcAmount value={order.price_usdc} iconSize={13} style={{ fontSize: 14, fontWeight: 700, color: "var(--sand)" }} />
                {order.status === "paid" && (
                  <button
                    type="button"
                    className="btn-sand"
                    onClick={() => { setShipModal(order.id); setTracking(""); setCarrier(""); }}
                    style={{ padding: "4px 12px", fontSize: 11, gap: 4 }}
                  >
                    <Truck size={11} /> Mark as Shipped
                  </button>
                )}
              </div>
            </div>

            {/* Shipping address */}
            {order.shipping_name && (
              <div style={{
                marginTop: 12, padding: "10px 12px", borderRadius: 8,
                border: "1px solid var(--border)", fontSize: 11,
                color: "var(--text-muted)", lineHeight: 1.6,
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text, white)", fontWeight: 600, fontSize: 12 }}>
                  <MapPin size={12} /> {order.shipping_name}
                </span>
                {order.shipping_address}, {order.shipping_city} {order.shipping_postal_code}, {order.shipping_country}
                {order.shipping_phone && <> · {order.shipping_phone}</>}
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Mark as Shipped Modal */}
      {shipModal && (
        <div className="modal-overlay" onClick={() => setShipModal(null)}>
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ padding: 28, width: "min(420px, 92vw)", margin: "auto" }}>
            <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 18, color: "var(--text, white)", marginBottom: 8 }}>
              <Truck size={16} color="var(--sky)" style={{ marginRight: 8, verticalAlign: "middle" }} />
              Mark as Shipped
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.6 }}>
              Enter the tracking number so the buyer can follow the shipment.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              <input className="input" placeholder="Tracking number" value={tracking}
                onChange={(e) => setTracking(e.target.value)} />
              <input className="input" placeholder="Carrier (optional, e.g. DHL, FedEx)" value={carrier}
                onChange={(e) => setCarrier(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" className="btn-ghost" onClick={() => setShipModal(null)} style={{ fontSize: 12 }}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-sand"
                disabled={submitting || !tracking.trim()}
                onClick={handleShip}
                style={{ fontSize: 12 }}
              >
                {submitting ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Truck size={13} />}
                Confirm Shipment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
