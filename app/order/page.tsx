"use client";

import { Package } from "lucide-react";
import Navbar from "../../components/Navbar";
import MobileBottomNav from "../../components/MobileBottomNav";
import OrderSubNav from "../../components/OrderSubNav";
import OrderList from "../../components/OrderList";
import { useApp } from "../../context/AppContext";

export default function OrderPage() {
  const { orders } = useApp();
  const activeCount = orders.filter((o) => o.status !== 2).length;

  return (
    <div className="page-shell">
      <Navbar variant="dashboard" />
      <main className="container" style={{ padding: "28px 0 48px" }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>Active</p>
          <h1 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(22px, 4vw, 28px)", color: "var(--text, white)" }}>Order</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 8 }}>Pesanan yang masih diproses — Redeemed atau Delivering.</p>
        </div>

        <OrderSubNav />

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <Package size={18} color="var(--sky)" />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text, white)" }}>Order Sekarang</h2>
          {activeCount > 0 && (
            <span className="badge badge-sand" style={{ fontSize: 10 }}>
              {activeCount}
            </span>
          )}
        </div>

        <OrderList filter="active" />
      </main>
      <MobileBottomNav />
    </div>
  );
}
