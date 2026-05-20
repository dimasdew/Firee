"use client";

import { useEffect, useState, useCallback } from "react";
import { adminGetAllOrders } from "../../../lib/supabase/admin";
import { useApp } from "../../../context/AppContext";
import type { DbOrder } from "../../../lib/supabase/types";
import { Loader2, Search, ExternalLink } from "lucide-react";
import UsdcAmount from "../../../components/UsdcAmount";
import { timeAgo } from "../../../lib/utils";

export default function AdminOrdersPage() {
  const { showToast } = useApp();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      const data = await adminGetAllOrders();
      setOrders(data);
    } catch (err: any) {
      showToast(err?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const totalRevenue = orders.reduce((s, o) => s + Number(o.price_usdc || 0), 0);
  const totalFees = orders.reduce((s, o) => s + Number(o.platform_fee_usdc || 0), 0);

  const filtered = orders.filter((o: any) => {
    const q = search.toLowerCase();
    return (
      (o.product?.title || "").toLowerCase().includes(q) ||
      (o.buyer?.username || "").toLowerCase().includes(q) ||
      (o.seller?.username || "").toLowerCase().includes(q) ||
      (o.tx_hash || "").toLowerCase().includes(q)
    );
  });

  const statusClass = (status: string) => {
    if (status === "completed") return "badge-green";
    if (status === "paid") return "badge-sky";
    if (status === "refunded" || status === "disputed") return "badge-sand";
    return "badge-sky";
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "64px 0" }}>
        <Loader2 size={24} color="var(--sky)" style={{ margin: "0 auto", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ padding: 16, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Total Orders</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text, white)" }}>{orders.length}</p>
        </div>
        <div className="card" style={{ padding: 16, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Total Volume</p>
          <UsdcAmount value={totalRevenue} iconSize={14} style={{ fontSize: 18, fontWeight: 700, color: "var(--sand)", justifyContent: "center" }} />
        </div>
        <div className="card" style={{ padding: 16, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Platform Fees</p>
          <UsdcAmount value={totalFees} iconSize={14} style={{ fontSize: 18, fontWeight: 700, color: "var(--sky)", justifyContent: "center" }} />
        </div>
        <div className="card" style={{ padding: 16, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Completed</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: "#4ade80" }}>{orders.filter((o) => o.status === "completed").length}</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          className="input"
          placeholder="Search by product, buyer, seller, or tx hash..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 34 }}
        />
      </div>

      {/* Orders table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Product</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Buyer</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Seller</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Amount</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Date</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Tx</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o: any) => (
                <tr key={o.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--text, white)" }}>
                    {o.product?.title || "—"}
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--text-muted)" }}>
                    {o.buyer?.display_name || o.buyer?.username || "—"}
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--text-muted)" }}>
                    {o.seller?.display_name || o.seller?.username || "—"}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <UsdcAmount value={Number(o.price_usdc)} iconSize={11} style={{ fontSize: 12, fontWeight: 600, color: "var(--sand)", justifyContent: "center" }} />
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <span className={`badge ${statusClass(o.status)}`} style={{ fontSize: 9 }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center", color: "var(--text-muted)", fontSize: 11 }}>
                    {timeAgo(o.created_at)}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    {o.tx_hash ? (
                      <a
                        href={`https://sepolia.basescan.org/tx/${o.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="icon-btn"
                        title="View transaction"
                      >
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: 11 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No orders found</p>
        )}
      </div>
    </div>
  );
}
