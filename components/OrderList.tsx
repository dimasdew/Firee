"use client";

import Link from "next/link";
import { useApp } from "../context/AppContext";
import { timeAgo } from "../lib/utils";
import UsdcAmount from "./UsdcAmount";
import type { Order, OrderStatus } from "../lib/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  0: "Redeemed",
  1: "Delivering",
  2: "Completed",
};

const STATUS_CLASS: Record<OrderStatus, string> = {
  0: "badge-sky",
  1: "badge-sand",
  2: "badge-green",
};

type OrderListFilter = "active" | "completed";

interface Props {
  filter: OrderListFilter;
}

function matchesFilter(order: Order, filter: OrderListFilter) {
  return filter === "completed" ? order.status === 2 : order.status !== 2;
}

export default function OrderList({ filter }: Props) {
  const { orders } = useApp();
  const filtered = orders.filter((o) => matchesFilter(o, filter));
  const isActive = filter === "active";

  if (filtered.length === 0) {
    return (
      <div className="card" style={{ padding: "56px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 40, marginBottom: 12, opacity: 0.25 }}>{isActive ? "🚚" : "📦"}</p>
        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text, white)", marginBottom: 8 }}>
          {isActive ? "Tidak ada order aktif" : "Belum ada pesanan selesai"}
        </p>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
          {isActive
            ? "Checkout produk dari cart untuk melihat pesanan yang sedang diproses di sini."
            : "Pesanan yang sudah Completed akan muncul di riwayat ini."}
        </p>
        {isActive ? (
          <Link href="/dashboard" className="btn-sand">
            Browse Products
          </Link>
        ) : (
          <Link href="/order" className="btn-ghost">
            Lihat Order Aktif
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
        {filtered.length} pesanan{isActive ? " aktif" : ""}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((order) => (
          <article key={order.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: "rgba(110,172,218,0.08)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  flexShrink: 0,
                }}
              >
                {order.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <p style={{ fontWeight: 600, fontSize: 15, color: "var(--text, white)" }}>{order.product}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  Qty {order.qty} · {timeAgo(order.createdAt)}
                </p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <span className={`badge ${STATUS_CLASS[order.status]}`} style={{ marginBottom: 8, display: "inline-flex" }}>
                  {STATUS_LABEL[order.status]}
                </span>
                <UsdcAmount
                  value={order.priceEth * order.qty}
                  iconSize={14}
                  style={{ fontSize: 15, fontWeight: 700, color: "var(--sand)", justifyContent: "flex-end" }}
                />
                <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>USDC total</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
