"use client";

import { TrendingUp, Eye, ShoppingCart, Star, ArrowUpRight, ArrowDownRight } from "lucide-react";
import UsdcAmount from "../../../components/UsdcAmount";

const STATS = [
  { label: "Views (30d)", value: "1,247", icon: Eye, color: "var(--sky)", change: "+18%", up: true },
  { label: "Conversion Rate", value: "3.2%", icon: ShoppingCart, color: "var(--sand)", change: "+0.4%", up: true },
  { label: "Avg Rating", value: "4.8", icon: Star, color: "#facc15", change: "0", up: true },
  { label: "Revenue (30d)", value: null, usdc: 142.50, icon: TrendingUp, color: "var(--sand)", change: "+24%", up: true },
];

const TOP_PRODUCTS = [
  { name: "Starter UI Kit", views: 843, sales: 12, revenue: 228, rating: 4.9 },
  { name: "Dashboard Template Pro", views: 404, sales: 0, revenue: 0, rating: 0 },
];

const RECENT_ORDERS = [
  { buyer: "alex_dev", product: "Starter UI Kit", amount: 19, date: "2h ago" },
  { buyer: "sarah_design", product: "Starter UI Kit", amount: 19, date: "1d ago" },
  { buyer: "crypto_mike", product: "Starter UI Kit", amount: 19, date: "3d ago" },
];

export default function AnalyticsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        {STATS.map((stat) => (
          <div key={stat.label} className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${stat.color}15`, display: "flex",
                alignItems: "center", justifyContent: "center",
              }}>
                <stat.icon size={15} color={stat.color} />
              </div>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{stat.label}</span>
            </div>
            {stat.usdc != null ? (
              <UsdcAmount value={stat.usdc} iconSize={14} style={{ fontSize: 20, fontWeight: 700, color: "var(--sand)" }} />
            ) : (
              <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text, white)" }}>{stat.value}</p>
            )}
            {stat.change !== "0" && (
              <p style={{ fontSize: 11, marginTop: 6, color: stat.up ? "#4ade80" : "#f87171", display: "flex", alignItems: "center", gap: 2 }}>
                {stat.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                {stat.change} vs last month
              </p>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Top Products */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)", marginBottom: 16 }}>Top Products</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TOP_PRODUCTS.map((p, i) => (
              <div key={p.name} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", borderRadius: 8,
                border: "1px solid var(--border)",
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: i === 0 ? "rgba(250,204,21,0.15)" : "rgba(110,172,218,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700,
                  color: i === 0 ? "#facc15" : "var(--text-muted)",
                }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text, white)" }}>{p.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    {p.views} views · {p.sales} sales
                    {p.rating > 0 && <> · ⭐ {p.rating}</>}
                  </p>
                </div>
                <UsdcAmount value={p.revenue} showLabel={false} iconSize={11} style={{ fontSize: 13, fontWeight: 600, color: "var(--sand)" }} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)", marginBottom: 16 }}>Recent Sales</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {RECENT_ORDERS.map((order, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", borderRadius: 8,
                border: "1px solid var(--border)",
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text, white)" }}>@{order.buyer}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{order.product}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <UsdcAmount value={order.amount} showLabel={false} iconSize={11} style={{ fontSize: 13, fontWeight: 600, color: "var(--sand)" }} />
                  <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{order.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
