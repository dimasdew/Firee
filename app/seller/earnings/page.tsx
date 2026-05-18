"use client";

import { DollarSign, ArrowUpRight, Clock, Wallet } from "lucide-react";
import UsdcAmount from "../../../components/UsdcAmount";
import { useApp } from "../../../context/AppContext";

export default function EarningsPage() {
  const { showToast } = useApp();

  // Mock data — will be replaced with Supabase queries
  const stats = {
    totalRevenue: 456.50,
    availableBalance: 228.25,
    pendingPayout: 0,
    totalWithdrawn: 228.25,
  };

  const recentPayouts = [
    { id: "1", amount: 114.125, status: "completed", date: "2025-05-10", tx_hash: "0xabc...def" },
    { id: "2", amount: 114.125, status: "completed", date: "2025-04-28", tx_hash: "0x123...456" },
  ];

  const handleWithdraw = () => {
    showToast("Withdrawal initiated — connect wallet to confirm");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <DollarSign size={14} color="var(--sand)" />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Total Revenue</span>
          </div>
          <UsdcAmount value={stats.totalRevenue} iconSize={16} style={{ fontSize: 20, fontWeight: 700, color: "var(--sand)" }} />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Wallet size={14} color="var(--sky)" />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Available</span>
          </div>
          <UsdcAmount value={stats.availableBalance} iconSize={16} style={{ fontSize: 20, fontWeight: 700, color: "var(--sky)" }} />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Clock size={14} color="var(--text-muted)" />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Pending</span>
          </div>
          <UsdcAmount value={stats.pendingPayout} iconSize={16} style={{ fontSize: 20, fontWeight: 700, color: "var(--text-muted)" }} />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <ArrowUpRight size={14} color="var(--sand)" />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Withdrawn</span>
          </div>
          <UsdcAmount value={stats.totalWithdrawn} iconSize={16} style={{ fontSize: 20, fontWeight: 700, color: "var(--sand)" }} />
        </div>
      </div>

      {/* Withdraw button */}
      <div className="card" style={{ padding: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text, white)", marginBottom: 4 }}>Withdraw Earnings</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Transfer available balance to your connected wallet (Base network, USDC)
          </p>
        </div>
        <button
          type="button"
          className="btn-sand"
          onClick={handleWithdraw}
          disabled={stats.availableBalance <= 0}
          style={{ padding: "10px 24px" }}
        >
          <Wallet size={14} /> Withdraw {stats.availableBalance.toFixed(2)} USDC
        </button>
      </div>

      {/* Payout history */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)", marginBottom: 16 }}>
          Payout History
        </h3>
        {recentPayouts.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>
            No payouts yet
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentPayouts.map((payout) => (
              <div
                key={payout.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 14px", borderRadius: 8,
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <UsdcAmount value={payout.amount} iconSize={12} style={{ fontSize: 14, fontWeight: 600, color: "var(--sand)" }} />
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{payout.date}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className="badge badge-green" style={{ fontSize: 9 }}>{payout.status}</span>
                  <p className="mono" style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>{payout.tx_hash}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
