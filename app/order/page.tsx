"use client";

import { Package, ShoppingBag } from "lucide-react";
import Navbar from "../../components/Navbar";
import MobileBottomNav from "../../components/MobileBottomNav";
import OrderSubNav from "../../components/OrderSubNav";
import OrderList from "../../components/OrderList";
import PurchasedOrderList from "../../components/PurchasedOrderList";
import { useApp } from "../../context/AppContext";
import AuthGuard from "../../components/AuthGuard";

export default function OrderPage() {
  const { orders } = useApp();
  const activeCount = orders.filter((o) => o.status !== 2).length;

  return (
    <AuthGuard>
    <div className="page-shell">
      <Navbar variant="dashboard" />
      <main className="container" style={{ padding: "28px 0 48px" }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>My Orders</p>
          <h1 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(22px, 4vw, 28px)", color: "var(--text, white)" }}>Orders</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 8 }}>Your purchases and active orders.</p>
        </div>

        <OrderSubNav />

        {/* Real Supabase purchases */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <ShoppingBag size={18} color="var(--sand)" />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text, white)" }}>Purchases</h2>
        </div>
        <div style={{ marginBottom: 32 }}>
          <PurchasedOrderList />
        </div>

        {/* Mock/demo orders */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <Package size={18} color="var(--sky)" />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text, white)" }}>Demo Orders</h2>
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
    </AuthGuard>
  );
}
