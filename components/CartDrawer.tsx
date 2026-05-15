"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { getProduct } from "../lib/products";
import UsdcAmount from "./UsdcAmount";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  const router = useRouter();
  const { cart, cartTotalEth, updateCartQty, removeFromCart, checkout, isLoggedIn } = useApp();

  const handleCheckout = () => {
    if (!isLoggedIn) {
      onClose();
      router.push("/login");
      return;
    }
    checkout();
    onClose();
    router.push("/order");
  };

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
              <p style={{ fontSize: 40, opacity: 0.2, marginBottom: 12 }}>🛒</p>
              <p style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>Cart is empty</p>
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
                  <div className="cart-item-emoji">{product.emoji}</div>
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
              <UsdcAmount value={cartTotalEth} iconSize={16} style={{ fontSize: 18, fontWeight: 700, color: "var(--sand)" }} />
            </div>
            <button type="button" className="btn-sand" style={{ width: "100%", justifyContent: "center" }} onClick={handleCheckout}>
              {isLoggedIn ? "Checkout & Redeem" : "Sign in to Checkout"}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
