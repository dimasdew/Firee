"use client";

import { useAccount } from "wagmi";
import { useApp } from "../../../context/AppContext";
import UsdcAmount from "../../../components/UsdcAmount";
import FireeConnectButton from "../../../components/FireeConnectButton";
import { Wallet, Copy, ExternalLink, LogOut } from "lucide-react";

function explorerUrl(address: string, chainId?: number) {
  if (chainId === 8453) return `https://basescan.org/address/${address}`;
  return `https://etherscan.io/address/${address}`;
}

export default function WalletPage() {
  const { user, disconnectWallet, cartTotalEth, showToast } = useApp();
  const { address, isConnected, chain } = useAccount();
  const wallet = (isConnected && address ? address : user?.walletAddress) ?? null;

  const copy = () => {
    if (!wallet) return;
    navigator.clipboard.writeText(wallet);
    showToast("Address copied!");
  };

  return (
    <div className="card" style={{ padding: 28 }}>
      <div className="badge badge-sky" style={{ marginBottom: 20, fontSize: 9 }}>
        Wallet
      </div>
      <h2 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 18, marginBottom: 20, color: "var(--text, white)" }}>
        Web3 Wallet
      </h2>

      {wallet ? (
        <>
          <div style={{ padding: 20, borderRadius: 12, background: "rgba(110,172,218,0.06)", border: "1px solid var(--border)", marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              Connected address
              {chain?.name ? ` · ${chain.name}` : ""}
            </p>
            <p className="mono" style={{ fontSize: 14, wordBreak: "break-all", color: "var(--sand)", marginBottom: 12 }}>
              {wallet}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" className="btn-ghost" style={{ fontSize: 12 }} onClick={copy}>
                <Copy size={13} /> Copy
              </button>
              <a
                href={explorerUrl(wallet, chain?.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
                style={{ fontSize: 12, textDecoration: "none" }}
              >
                <ExternalLink size={13} /> Explorer
              </a>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
            <div className="card" style={{ padding: 16, textAlign: "center" }}>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Balance (demo)</p>
              <UsdcAmount value={1.24} iconSize={16} style={{ fontSize: 18, fontWeight: 700, color: "var(--sand)", justifyContent: "center" }} />
            </div>
            <div className="card" style={{ padding: 16, textAlign: "center" }}>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Cart pending</p>
              <UsdcAmount value={cartTotalEth} iconSize={16} style={{ fontSize: 18, fontWeight: 700, color: "var(--sky)", justifyContent: "center" }} />
            </div>
          </div>
          <button type="button" className="logout-btn" style={{ width: "100%" }} onClick={disconnectWallet}>
            <LogOut size={13} /> Disconnect Wallet
          </button>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <Wallet size={40} color="var(--sky)" style={{ margin: "0 auto 16px", opacity: 0.6 }} />
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>
            Connect via Rainbow — MetaMask, Coinbase Wallet, WalletConnect, dan lainnya.
          </p>
          <FireeConnectButton variant="sand" fullWidth />
        </div>
      )}
    </div>
  );
}
