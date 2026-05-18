"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, ExternalLink } from "lucide-react";
import Navbar from "../../../components/Navbar";
import MobileBottomNav from "../../../components/MobileBottomNav";
import AuthGuard from "../../../components/AuthGuard";
import { useApp } from "../../../context/AppContext";
import { getProduct } from "../../../lib/products";
import UsdcAmount from "../../../components/UsdcAmount";

const STATUS_STEPS = [
  { label: "Redeemed", icon: Package, desc: "Order placed on-chain" },
  { label: "Delivering", icon: Truck, desc: "Being shipped to you" },
  { label: "Completed", icon: CheckCircle, desc: "Delivered successfully" },
];

function OrderDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { orders } = useApp();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <AuthGuard>
        <div className="page-shell">
          <Navbar variant="dashboard" />
          <main className="container" style={{ padding: "28px 0 48px", textAlign: "center" }}>
            <Package size={48} color="var(--sky)" style={{ margin: "60px auto 16px", opacity: 0.4 }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text, white)", marginBottom: 8 }}>Order not found</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>This order may have been removed or doesn&apos;t exist.</p>
            <Link href="/order" className="btn-ghost">Back to Orders</Link>
          </main>
          <MobileBottomNav />
        </div>
      </AuthGuard>
    );
  }

  const product = getProduct(order.productId);
  const total = order.priceEth * order.qty;
  const createdDate = new Date(order.createdAt);
  const statusIndex = order.status;

  return (
    <AuthGuard>
      <div className="page-shell">
        <Navbar variant="dashboard" />
        <main className="container" style={{ padding: "28px 0 48px" }}>
          <Link href="/order" className="back-link">
            <ArrowLeft size={14} /> Back to Orders
          </Link>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, maxWidth: 600 }}>
            {/* Order Header */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Order ID</p>
                  <p className="mono" style={{ fontSize: 12, color: "var(--sky)", marginTop: 2 }}>{order.id}</p>
                </div>
                <span className={`badge ${statusIndex === 2 ? "badge-green" : statusIndex === 1 ? "badge-sky" : "badge-sand"}`} style={{ fontSize: 10 }}>
                  {STATUS_STEPS[statusIndex].label}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 10, background: "rgba(110,172,218,0.04)", border: "1px solid var(--border)" }}>
                <div style={{ width: 56, height: 64, borderRadius: 8, background: "rgba(110,172,218,0.06)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                  {product?.image
                    ? <img src={product.image} alt={order.product} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    : <span style={{ fontSize: 28 }}>{order.emoji}</span>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)" }}>{order.product}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Qty: {order.qty}</p>
                  <UsdcAmount value={total} iconSize={14} style={{ fontSize: 14, fontWeight: 700, color: "var(--sand)", marginTop: 6 }} />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text, white)", marginBottom: 20 }}>Order Timeline</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {STATUS_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const isCompleted = i <= statusIndex;
                  const isCurrent = i === statusIndex;
                  return (
                    <div key={step.label} style={{ display: "flex", gap: 14 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: isCompleted ? "rgba(226,226,182,0.1)" : "rgba(110,172,218,0.04)",
                          border: `1.5px solid ${isCompleted ? "var(--sand)" : "var(--border)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.3s",
                        }}>
                          <Icon size={14} color={isCompleted ? "var(--sand)" : "var(--text-muted)"} />
                        </div>
                        {i < STATUS_STEPS.length - 1 && (
                          <div style={{ width: 2, height: 32, background: i < statusIndex ? "var(--sand)" : "var(--border)", transition: "background 0.3s" }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: 16 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: isCurrent ? "var(--sand)" : isCompleted ? "var(--text, white)" : "var(--text-muted)" }}>{step.label}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{step.desc}</p>
                        {isCurrent && (
                          <p className="mono" style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, opacity: 0.6 }}>
                            {createdDate.toLocaleDateString()} {createdDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Details */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text, white)", marginBottom: 16 }}>Details</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Product", value: order.product },
                  { label: "Quantity", value: `${order.qty}` },
                  { label: "Unit Price", value: `${order.priceEth} USDC` },
                  { label: "Total", value: `${total.toFixed(4)} USDC` },
                  { label: "Date", value: createdDate.toLocaleDateString() },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{row.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text, white)" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <MobileBottomNav />
      </div>
    </AuthGuard>
  );
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="page-shell" style={{ minHeight: "100vh" }} />}>
      <OrderDetailContent params={params} />
    </Suspense>
  );
}
