"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Wallet, CheckCircle, Loader2, AlertCircle, ExternalLink, Truck } from "lucide-react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useFireePurchase } from "../lib/contracts/useFireeEscrow";
import { CHAIN_ID, CHAIN_NAME } from "../lib/contracts";
import { createOrder, type ShippingInfo } from "../lib/supabase/orders";
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
    shipping_fee_usdc?: number | null;
    ships_from_country?: string | null;
  };
}

export default function PurchaseModal({ open, onClose, onSuccess, product }: Props) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { step, error, txHash, escrowOrderId, purchase, reset, usdcBalance } = useFireePurchase();

  const wrongChain = chainId !== CHAIN_ID;
  const shippingFee = product.shipping_fee_usdc ?? 0;
  const platformFee = (product.price_usdc + shippingFee) * 0.03;
  const total = product.price_usdc + shippingFee;
  const insufficientBalance = usdcBalance !== null && usdcBalance < total;

  // Physical goods: shipping address collected before payment
  const [shipping, setShipping] = useState<ShippingInfo>({
    shipping_name: "",
    shipping_address: "",
    shipping_city: "",
    shipping_postal_code: "",
    shipping_country: "",
    shipping_phone: "",
  });
  const [addressConfirmed, setAddressConfirmed] = useState(false);

  const shippingValid =
    shipping.shipping_name.trim() !== "" &&
    shipping.shipping_address.trim() !== "" &&
    shipping.shipping_city.trim() !== "" &&
    shipping.shipping_postal_code.trim() !== "" &&
    shipping.shipping_country.trim() !== "";

  const handlePurchase = async () => {
    if (!product.seller_wallet) return;
    const result = await purchase(
      product.seller_wallet as `0x${string}`,
      total,
      product.id
    );
    if (result) {
      // Record order in Supabase — C2: price verified in createOrder against DB
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user && product.seller_id) {
          const order = await createOrder({
            buyer_id: user.id,
            product_id: product.id,
            seller_id: product.seller_id,
            price_usdc: product.price_usdc,
            platform_fee_usdc: platformFee,
            seller_revenue_usdc: total - platformFee,
            tx_hash: result.txHash,
            escrow_order_id: result.escrowOrderId, // C5
            shipping,
          });
          // Update product sales count (best-effort)
          try {
            await supabase.rpc("increment_product_sales", {
              p_id: product.id,
              amount: product.price_usdc,
            });
          } catch {}
          // C8: pass orderId so server resolves emails from DB
          try {
            await fetch("/api/notify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "purchase", orderId: order.id }),
            });
          } catch {}
        }
      } catch (err) {
        console.error("Failed to record order:", err);
      }
      onSuccess(result.txHash);
    }
  };

  // M7: disable backdrop close while tx is in-flight
  const handleClose = () => {
    if (step === "approving" || step === "purchasing") return;
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
          <h3 id="purchase-title" style={{ fontSize: 16, fontWeight: 700, color: "var(--text, white)" }}>
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
            padding: 16, borderRadius: 12,
            background: "rgba(110,172,218,0.04)",
            border: "1px solid var(--border)", marginBottom: 20,
          }}>
            <div style={{
              position: "relative", width: 48, height: 48, borderRadius: 8,
              background: "rgba(110,172,218,0.08)",
              border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", flexShrink: 0,
            }}>
              {product.thumbnail_url
                ? <Image src={product.thumbnail_url} alt="" fill sizes="48px" style={{ objectFit: "cover" }} />
                : <Wallet size={18} color="var(--sky)" style={{ opacity: 0.5 }} />
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text, white)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {product.title}
              </p>
              <UsdcAmount value={product.price_usdc} iconSize={12} style={{ fontSize: 14, fontWeight: 700, color: "var(--sand)", marginTop: 2 }} />
            </div>
          </div>

          {/* Price breakdown */}
          <div style={{ marginBottom: 20, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "var(--text-muted)" }}>
              <span>Price</span>
              <span>{product.price_usdc.toFixed(2)} USDC</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "var(--text-muted)" }}>
              <span>Shipping{product.ships_from_country ? ` (from ${product.ships_from_country})` : ""}</span>
              <span>{shippingFee > 0 ? `${shippingFee.toFixed(2)} USDC` : "Free"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "var(--text-muted)", fontSize: 12, opacity: 0.7 }}>
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
              <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12 }}>
                Please switch to <strong>{CHAIN_NAME}</strong>
              </p>
              <button type="button" className="btn-primary" style={{ width: "100%" }}
                onClick={() => switchChain({ chainId: CHAIN_ID })}>
                Switch Network
              </button>
            </div>
          ) : step === "success" ? (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <CheckCircle size={40} color="#4ade80" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: 16, fontWeight: 700, color: "#4ade80", marginBottom: 4 }}>
                Purchase Complete!
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
                Payment is held in escrow. The seller will ship your item soon.
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
              <p style={{ fontSize: 14, color: "#f87171", marginBottom: 8 }}>{error}</p>
              <button type="button" className="btn-ghost btn-sm" onClick={reset} >
                Try Again
              </button>
            </div>
          ) : !addressConfirmed ? (
            <>
              {/* Shipping address form */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Truck size={14} color="var(--sky)" />
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text, white)" }}>Shipping Address</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                <input className="input" placeholder="Full name" value={shipping.shipping_name}
                  onChange={(e) => setShipping({ ...shipping, shipping_name: e.target.value })} />
                <input className="input" placeholder="Street address" value={shipping.shipping_address}
                  onChange={(e) => setShipping({ ...shipping, shipping_address: e.target.value })} />
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="input" placeholder="City" style={{ flex: 1 }} value={shipping.shipping_city}
                    onChange={(e) => setShipping({ ...shipping, shipping_city: e.target.value })} />
                  <input className="input" placeholder="Postal code" style={{ width: 120 }} value={shipping.shipping_postal_code}
                    onChange={(e) => setShipping({ ...shipping, shipping_postal_code: e.target.value })} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="input" placeholder="Country" style={{ flex: 1 }} value={shipping.shipping_country}
                    onChange={(e) => setShipping({ ...shipping, shipping_country: e.target.value })} />
                  <input className="input" placeholder="Phone (optional)" style={{ flex: 1 }} value={shipping.shipping_phone}
                    onChange={(e) => setShipping({ ...shipping, shipping_phone: e.target.value })} />
                </div>
              </div>
              <button
                type="button"
                className="btn-sand"
                disabled={!shippingValid}
                onClick={() => setAddressConfirmed(true)}
                style={{ width: "100%", justifyContent: "center", padding: "14px 20px", fontSize: 14 }}
              >
                Continue to Payment
              </button>
            </>
          ) : (
            <>
              {/* Ship-to summary */}
              <div style={{
                display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8,
                padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", marginBottom: 12,
              }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text, white)", fontWeight: 600, fontSize: 12 }}>
                    <Truck size={12} /> {shipping.shipping_name}
                  </span>
                  {shipping.shipping_address}, {shipping.shipping_city} {shipping.shipping_postal_code}, {shipping.shipping_country}
                </div>
                <button type="button" className="btn-ghost btn-sm" style={{ flexShrink: 0 }}
                  onClick={() => setAddressConfirmed(false)}>
                  Edit
                </button>
              </div>

              {/* Balance info */}
              {usdcBalance !== null && (
                <p style={{
                  fontSize: 12, color: insufficientBalance ? "#f87171" : "var(--text-muted)",
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
