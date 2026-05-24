"use client";

import Navbar from "../../components/Navbar";
import MobileBottomNav from "../../components/MobileBottomNav";
import PurchasedOrderList from "../../components/PurchasedOrderList";
import AuthGuard from "../../components/AuthGuard";

export default function OrderPage() {
  return (
    <AuthGuard>
    <div className="page-shell">
      <Navbar variant="dashboard" />
      <main className="container" style={{ padding: "28px 0 48px" }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>My Orders</p>
          <h1 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(22px, 4vw, 28px)", color: "var(--text, white)" }}>Orders</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 8 }}>Your digital product purchases.</p>
        </div>

        <PurchasedOrderList />
      </main>
      <MobileBottomNav />
    </div>
    </AuthGuard>
  );
}
