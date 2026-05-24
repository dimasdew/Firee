"use client";

import { useEffect, useState } from "react";
import { Users, Package, ShoppingBag, DollarSign, TrendingUp, Loader2, Flag, AlertCircle } from "lucide-react";
import UsdcAmount from "../../../components/UsdcAmount";
import { createClient } from "../../../lib/supabase/client";

interface PlatformStats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  platformFees: number;
  pendingReports: number;
  pendingDisputes: number;
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_seller", true),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id, price_usdc, platform_fee_usdc"),
      supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("disputes").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]).then(([users, sellers, products, orders, reports, disputes]) => {
      const orderData = (orders.data || []) as { id: string; price_usdc: number; platform_fee_usdc: number }[];
      setStats({
        totalUsers: users.count ?? 0,
        totalSellers: sellers.count ?? 0,
        totalProducts: products.count ?? 0,
        totalOrders: orderData.length,
        totalRevenue: orderData.reduce((s, o) => s + (o.price_usdc || 0), 0),
        platformFees: orderData.reduce((s, o) => s + (o.platform_fee_usdc || 0), 0),
        pendingReports: reports.count ?? 0,
        pendingDisputes: disputes.count ?? 0,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <Loader2 size={24} color="var(--sky)" style={{ margin: "0 auto", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "var(--sky)" },
    { label: "Sellers", value: stats.totalSellers, icon: Users, color: "var(--sand)" },
    { label: "Products", value: stats.totalProducts, icon: Package, color: "var(--sky)" },
    { label: "Orders", value: stats.totalOrders, icon: ShoppingBag, color: "var(--sand)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 18, color: "var(--text, white)" }}>
        Platform Analytics
      </h2>

      {/* Count cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        {cards.map((c) => (
          <div key={c.label} className="card" style={{ padding: 20, textAlign: "center" }}>
            <c.icon size={18} color={c.color} style={{ margin: "0 auto 8px", opacity: 0.6 }} />
            <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text, white)" }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <DollarSign size={14} color="var(--sand)" />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Total GMV</span>
          </div>
          <UsdcAmount value={stats.totalRevenue} iconSize={16} style={{ fontSize: 22, fontWeight: 700, color: "var(--sand)" }} />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <TrendingUp size={14} color="var(--sky)" />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Platform Fees (3%)</span>
          </div>
          <UsdcAmount value={stats.platformFees} iconSize={16} style={{ fontSize: 22, fontWeight: 700, color: "var(--sky)" }} />
        </div>
      </div>

      {/* Moderation cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(248,113,113,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Flag size={18} color="#f87171" />
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Pending Reports</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: stats.pendingReports > 0 ? "#f87171" : "var(--text, white)" }}>
              {stats.pendingReports}
            </p>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(251,191,36,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertCircle size={18} color="#fbbf24" />
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Pending Disputes</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: stats.pendingDisputes > 0 ? "#fbbf24" : "var(--text, white)" }}>
              {stats.pendingDisputes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
