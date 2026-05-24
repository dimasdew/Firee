"use client";

import { useEffect, useState } from "react";
import { DollarSign, ArrowUpRight, Clock, Wallet, Loader2, ExternalLink } from "lucide-react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import UsdcAmount from "../../../components/UsdcAmount";
import { useApp } from "../../../context/AppContext";
import { useSellerWithdraw } from "../../../lib/contracts/useFireeEscrow";
import { createClient } from "../../../lib/supabase/client";
import { getSellerOrders } from "../../../lib/supabase/orders";
import { CHAIN_ID } from "../../../lib/contracts";

interface PayoutRecord {
  id: string;
  amount_usdc: number;
  status: string;
  tx_hash: string | null;
  created_at: string;
}

export default function EarningsPage() {
  const { showToast } = useApp();
  const { isConnected } = useAccount();
  const { sellerBalance, withdraw, loading: withdrawing, error: withdrawError } = useSellerWithdraw();
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;

      // Fetch seller orders for total revenue
      const orders = await getSellerOrders(user.id);
      const revenue = orders.reduce((sum, o) => sum + (o.seller_revenue_usdc || 0), 0);
      setTotalRevenue(revenue);

      // Fetch payout history
      const { data } = await supabase
        .from("payouts")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setPayouts(data as PayoutRecord[]);
        const withdrawn = (data as PayoutRecord[])
          .filter((p) => p.status === "completed")
          .reduce((sum, p) => sum + p.amount_usdc, 0);
        setTotalWithdrawn(withdrawn);
      }
    });
  }, []);

  const stats = {
    totalRevenue,
    availableBalance: sellerBalance,
    pendingPayout: payouts.filter((p) => p.status === "pending" || p.status === "processing").reduce((s, p) => s + p.amount_usdc, 0),
    totalWithdrawn,
  };

  const handleWithdraw = async () => {
    const tx = await withdraw();
    if (tx) {
      showToast("Withdrawal successful!");
      // Record payout in Supabase
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("payouts").insert({
          seller_id: user.id,
          amount_usdc: sellerBalance,
          wallet_address: user.user_metadata?.wallet_address || "",
          tx_hash: typeof tx === "string" ? tx : null,
          status: "completed",
        });
      }
    } else if (withdrawError) {
      showToast(withdrawError);
    }
  };

  const basescanBase = CHAIN_ID === 8453 ? "https://basescan.org" : "https://sepolia.basescan.org";

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
        {!isConnected ? (
          <ConnectButton />
        ) : (
          <button
            type="button"
            className="btn-sand"
            onClick={handleWithdraw}
            disabled={stats.availableBalance <= 0 || withdrawing}
            style={{ padding: "10px 24px" }}
          >
            {withdrawing
              ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Withdrawing...</>
              : <><Wallet size={14} /> Withdraw {stats.availableBalance.toFixed(2)} USDC</>
            }
          </button>
        )}
      </div>

      {/* Payout history */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)", marginBottom: 16 }}>
          Payout History
        </h3>
        {payouts.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>
            No payouts yet
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {payouts.map((payout) => (
              <div
                key={payout.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 14px", borderRadius: 8,
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <UsdcAmount value={payout.amount_usdc} iconSize={12} style={{ fontSize: 14, fontWeight: 600, color: "var(--sand)" }} />
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    {new Date(payout.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <span className={`badge ${payout.status === "completed" ? "badge-green" : payout.status === "failed" ? "badge-sky" : "badge-sand"}`} style={{ fontSize: 9 }}>
                    {payout.status}
                  </span>
                  {payout.tx_hash && (
                    <a href={`${basescanBase}/tx/${payout.tx_hash}`} target="_blank" rel="noopener noreferrer" className="mono" style={{ fontSize: 10, color: "var(--sky)", textDecoration: "none" }}>
                      {payout.tx_hash.slice(0, 10)}…
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
