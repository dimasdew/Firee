"use client";

import Navbar from "../../../components/Navbar";
import MobileBottomNav from "../../../components/MobileBottomNav";
import OrderSubNav from "../../../components/OrderSubNav";
import OrderList from "../../../components/OrderList";
import AuthGuard from "../../../components/AuthGuard";

export default function OrderPreviousPage() {
  return (
    <AuthGuard>
    <div className="page-shell">
      <Navbar variant="dashboard" />
      <main className="container" style={{ padding: "28px 0 48px" }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>History</p>
          <h1 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(22px, 4vw, 28px)", color: "var(--text, white)" }}>Order</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 8 }}>History of completed orders.</p>
        </div>

        <OrderSubNav />

        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text, white)", marginBottom: 20 }}>Previous Order</h2>
        <OrderList filter="completed" />
      </main>
      <MobileBottomNav />
    </div>
    </AuthGuard>
  );
}
