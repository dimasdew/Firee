"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, ShoppingBag, Trash2, AlertTriangle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { getProduct } from "../lib/products";
import UsdcAmount from "./UsdcAmount";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  const router = useRouter();
  const { cart, cartTotalUsdc, updateCartQty, removeFromCart, checkout, isLoggedIn, cartCount } = useApp();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleCheckout = () => {
    if (!isLoggedIn) {
      onClose();
      router.push("/login");
      return;
    }
    setConfirmOpen(true);
  };

  const confirmCheckout = () => {
    setConfirmOpen(false);
    checkout();
    onClose();
    router.push("/order");
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (confirmOpen) setConfirmOpen(false);
      else onClose();
    }
  }, [confirmOpen, onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} aria-hidden />
      <aside className="cart-drawer" role="dialog" aria-label="Shopping cart">
        <div className="cart-drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShoppingBag size={18} color="var(--sky)" />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text, white)" }}>Your Cart</h2>
            {cart.length > 0 && <span className="badge badge-sky" style={{ fontSize: 10 }}>{cart.length}</span>}
          </div>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Close cart">
            <X size={18} />
          </button>
        </div>

        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <img src="/illustrations/empty-cart.svg" alt="" style={{ width: 80, height: 80, margin: "0 auto 12px", opacity: 0.8 }} />
              <p style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>Cart is empty</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, opacity: 0.6 }}>Add products to get started</p>
              <Link href="/dashboard" className="btn-ghost" style={{ marginTop: 16 }} onClick={onClose}>
                Browse Products
              </Link>
            </div>
          ) : (
            cart.map((item) => {
              const product = getProduct(item.productId);
              if (!product) return null;
              return (
                <div key={item.productId} className="cart-item">
                  <div className="cart-item-emoji" style={{ overflow: "hidden" }}>
                    {product.image ? <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : product.emoji}
                  </div>
                  <div className="cart-item-info">
                    <p style={{ fontWeight: 600, fontSize: 13 }}>{product.name}</p>
                    <UsdcAmount
                      value={parseFloat(product.price) * item.qty}
                      iconSize={12}
                      style={{ marginTop: 2, fontSize: 12, color: "var(--sand)" }}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                      <div className="qty-control">
                        <button type="button" onClick={() => updateCartQty(item.productId, item.qty - 1)} aria-label="Decrease">
                          <Minus size={12} />
                        </button>
                        <span className="mono">{item.qty}</span>
                        <button type="button" onClick={() => updateCartQty(item.productId, item.qty + 1)} aria-label="Increase">
                          <Plus size={12} />
                        </button>
                      </div>
                      <button type="button" onClick={() => removeFromCart(item.productId)} className="icon-btn danger" aria-label="Remove">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-total-row">
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Total</span>
              <UsdcAmount value={cartTotalUsdc} iconSize={16} style={{ fontSize: 18, fontWeight: 700, color: "var(--sand)" }} />
            </div>
            <button type="button" className="btn-sand" style={{ width: "100%", justifyContent: "center" }} onClick={handleCheckout}>
              {isLoggedIn ? "Checkout & Redeem" : "Login to Checkout"}
            </button>
          </div>
        )}
      </aside>

      {/* Confirm Checkout Modal */}
      {confirmOpen && (
        <>
          <div className="drawer-backdrop" style={{ zIndex: 1001 }} onClick={() => setConfirmOpen(false)} aria-hidden />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1002, width: "90%", maxWidth: 380, background: "var(--card-bg, #0a1929)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(226,226,182,0.08)", border: "1px solid rgba(226,226,182,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <ShoppingBag size={22} color="var(--sand)" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text, white)", marginBottom: 8 }}>Confirm Checkout</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.5 }}>
              You&apos;re about to redeem <strong>{cartCount} item{cartCount !== 1 ? "s" : ""}</strong> for a total of:
            </p>
            <UsdcAmount value={cartTotalUsdc} iconSize={20} style={{ fontSize: 24, fontWeight: 700, color: "var(--sand)", justifyContent: "center", marginBottom: 24 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setConfirmOpen(false)}>Cancel</button>
              <button type="button" className="btn-sand" style={{ flex: 1, justifyContent: "center" }} onClick={confirmCheckout}>Confirm</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
