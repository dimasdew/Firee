"use client";

import { useState } from "react";
import { X, Wallet, CheckCircle, Loader2, AlertCircle, ExternalLink, Download } from "lucide-react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useFireePurchase } from "../lib/contracts/useFireeEscrow";
import { CHAIN_ID, CHAIN_NAME } from "../lib/contracts";
import { createOrder } from "../lib/supabase/orders";
import { createClient } from "../lib/supabase/client";
import UsdcAmount from "./UsdcAmount";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (txHash: string) => void;
  product: {
    id: string;
    title: string;
    price_usdc: number;
    seller_id?: string;
    seller_wallet: string;
    thumbnail_url?: string | null;
  };
}

export default function PurchaseModal({ open, onClose, onSuccess, product }: Props) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { step, error, txHash, purchase, reset, usdcBalance } = useFireePurchase();

  const wrongChain = chainId !== CHAIN_ID;
  const platformFee = product.price_usdc * 0.03;
  const total = product.price_usdc;
  const insufficientBalance = usdcBalance !== null && usdcBalance < total;

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handlePurchase = async () => {
    if (!product.seller_wallet) return;
    const tx = await purchase(
      product.seller_wallet as `0x${string}`,
      product.price_usdc,
      product.id
    );
    if (tx) {
      // Record order in Supabase
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user && product.seller_id) {
          const fee = product.price_usdc * 0.03;
          const order = await createOrder({
            buyer_id: user.id,
            product_id: product.id,
            seller_id: product.seller_id,
            price_usdc: product.price_usdc,
            platform_fee_usdc: fee,
            seller_revenue_usdc: product.price_usdc - fee,
            tx_hash: tx,
          });
          // Update product sales count (best-effort)
          try {
            await supabase.rpc("increment_product_sales", {
              p_id: product.id,
              amount: product.price_usdc,
            });
          } catch {}
          // Send email notifications (best-effort)
          try {
            await fetch("/api/notify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "purchase",
                buyerEmail: user.email,
                sellerEmail: product.seller?.email,
                productTitle: product.title,
                priceUsdc: product.price_usdc,
                txHash: tx,
              }),
            });
          } catch {}
        }
      } catch (err) {
        console.error("Failed to record order:", err);
      }
      onSuccess(tx);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="drawer-backdrop" onClick={handleClose} aria-hidden />
      <div
        className="purchase-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-title"
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1001, width: "min(440px, 92vw)",
          background: "var(--card-bg)", borderRadius: 16,
          border: "1px solid var(--border)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 20px", borderBottom: "1px solid var(--border)",
        }}>
          <h3 id="purchase-title" style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)" }}>
            Checkout
          </h3>
          <button type="button" className="icon-btn" onClick={handleClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 20 }}>
          {/* Product summary */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: 14, borderRadius: 10,
            background: "rgba(110,172,218,0.04)",
            border: "1px solid var(--border)", marginBottom: 20,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 8,
              background: "rgba(110,172,218,0.08)",
              border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", flexShrink: 0,
            }}>
              {product.thumbnail_url
                ? <img src={product.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <Wallet size={18} color="var(--sky)" style={{ opacity: 0.5 }} />
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text, white)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {product.title}
              </p>
              <UsdcAmount value={product.price_usdc} iconSize={12} style={{ fontSize: 13, fontWeight: 700, color: "var(--sand)", marginTop: 2 }} />
            </div>
          </div>

          {/* Price breakdown */}
          <div style={{ marginBottom: 20, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "var(--text-muted)" }}>
              <span>Price</span>
              <span>{product.price_usdc.toFixed(2)} USDC</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "var(--text-muted)", fontSize: 11, opacity: 0.7 }}>
              <span>Platform fee (3%, deducted from seller)</span>
              <span>−{platformFee.toFixed(2)} USDC</span>
            </div>
            <div className="divider" style={{ margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "var(--text, white)" }}>
              <span>You pay</span>
              <span>{total.toFixed(2)} USDC</span>
            </div>
          </div>

          {/* Step-based UI */}
          {!isConnected ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
                Connect your wallet to pay with USDC on {CHAIN_NAME}
              </p>
              <ConnectButton />
            </div>
          ) : wrongChain ? (
            <div style={{ textAlign: "center" }}>
              <AlertCircle size={24} color="#f59e0b" style={{ margin: "0 auto 8px" }} />
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
                Please switch to <strong>{CHAIN_NAME}</strong>
              </p>
              <button type="button" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}
                onClick={() => switchChain({ chainId: CHAIN_ID })}>
                Switch Network
              </button>
            </div>
          ) : step === "success" ? (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <CheckCircle size={40} color="#4ade80" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: 15, fontWeight: 700, color: "#4ade80", marginBottom: 4 }}>
                Purchase Complete!
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
                Your digital product is ready for download.
              </p>
              {txHash && (
                <a
                  href={`https://sepolia.basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: "var(--sky)", display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  View transaction <ExternalLink size={11} />
                </a>
              )}
            </div>
          ) : step === "error" ? (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <AlertCircle size={32} color="#f87171" style={{ margin: "0 auto 8px" }} />
              <p style={{ fontSize: 13, color: "#f87171", marginBottom: 8 }}>{error}</p>
              <button type="button" className="btn-ghost" onClick={reset} style={{ fontSize: 12 }}>
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Balance info */}
              {usdcBalance !== null && (
                <p style={{
                  fontSize: 11, color: insufficientBalance ? "#f87171" : "var(--text-muted)",
                  marginBottom: 12,
                }}>
                  Wallet balance: {usdcBalance.toFixed(2)} USDC
                  {insufficientBalance && " — Insufficient balance"}
                </p>
              )}

              {/* Action button */}
              <button
                type="button"
                className="btn-sand"
                disabled={step !== "idle" || insufficientBalance}
                onClick={handlePurchase}
                style={{ width: "100%", justifyContent: "center", padding: "14px 20px", fontSize: 14 }}
              >
                {step === "approving" ? (
                  <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Approving USDC...</>
                ) : step === "purchasing" ? (
                  <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Confirming Purchase...</>
                ) : (
                  <>Pay {total.toFixed(2)} USDC</>
                )}
              </button>

              <p style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 8, opacity: 0.6 }}>
                Payments are processed on-chain via smart contract escrow
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
