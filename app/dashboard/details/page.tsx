"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import ProductCard from "../../../components/ProductCard";
import MobileBottomNav from "../../../components/MobileBottomNav";
import { useApp } from "../../../context/AppContext";
import { getProduct, PRODUCTS } from "../../../lib/products";
import UsdcAmount from "../../../components/UsdcAmount";
import { ArrowLeft, Minus, Plus, CheckCircle, ShoppingCart, Share2, Wallet } from "lucide-react";
import PurchaseModal from "../../../components/PurchaseModal";

function DetailsContent() {
  const params = useSearchParams();
  const id = Number(params.get("id") || "1");
  const product = getProduct(id) ?? getProduct(1)!;
  const { addToCart, showToast } = useApp();
  const [qty, setQty] = useState(1);
  const [showPurchase, setShowPurchase] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/dashboard/details?id=${product.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: product.name, text: product.tagline, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard!");
    }
  };

  const related = useMemo(
    () => PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3),
    [product]
  );

  const total = parseFloat(product.price) * qty;


  return (
    <div className="page-shell">
      <Navbar variant="dashboard" />
      <main className="container" style={{ padding: "28px 0 48px" }}>
        <Link href="/dashboard" className="back-link">
          <ArrowLeft size={14} /> Back to Marketplace
        </Link>

        <div className="detail-grid">
          <div>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Verified
                </span>
                <button type="button" onClick={handleShare} className="icon-btn" style={{ marginLeft: "auto" }} aria-label="Share product">
                  <Share2 size={13} />
                </button>
                <span className="badge badge-green" style={{ fontSize: 9 }}>Live</span>
              </div>
              <div style={{ padding: "32px 24px", textAlign: "center" }}>
                <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 20, color: "var(--text, white)" }}>{product.name}</p>
                <div style={{ width: 100, height: 120, margin: "0 auto 20px", borderRadius: 10, background: "rgba(110,172,218,0.05)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, overflow: "hidden" }}>
                  {product.image ? <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : product.emoji}
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "rgba(226,226,182,0.06)", border: "1px solid rgba(226,226,182,0.15)", marginBottom: 20 }}>
                  <UsdcAmount value={product.price} showLabel={false} iconSize={16} style={{ fontSize: 18, fontWeight: 700, color: "var(--sand)" }} />
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>/ item</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
                  <div className="qty-control">
                    <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease"><Minus size={13} /></button>
                    <span className="mono">{qty}</span>
                    <button type="button" onClick={() => setQty(qty + 1)} aria-label="Increase"><Plus size={13} /></button>
                  </div>
                  <button type="button" className="btn-ghost" onClick={() => addToCart(product.id, qty)} style={{ gap: 6 }}>
                    <ShoppingCart size={13} /> Add to Cart
                  </button>
                  <button type="button" className="btn-primary" onClick={() => setShowPurchase(true)} style={{ gap: 6 }}>
                    <Wallet size={13} /> Buy with USDC
                  </button>
                </div>
              </div>
            </div>
            {related.length > 0 && (
              <>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "16px 0 10px" }}>Related products</p>
                <div className="related-grid">
                  {related.map((p) => <ProductCard key={p.id} {...p} />)}
                </div>
              </>
            )}
          </div>

          <div className="card" style={{ padding: 28 }}>
            <span className="badge badge-sky" style={{ marginBottom: 16, fontSize: 9 }}>Product Info</span>
            <h2 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", marginBottom: 4, color: "var(--text, white)" }}>{product.name}</h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>By {product.company}</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--sky)", marginBottom: 16 }}>{product.tagline}</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>{product.stock} in stock</p>
            <div className="divider" style={{ marginBottom: 20 }} />
            <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text-muted)", marginBottom: 12 }}>{product.description}</p>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text-muted)", marginBottom: 24 }}>{product.description2}</p>
            <div className="divider" style={{ marginBottom: 16 }} />
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12 }}>Benefits</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {product.benefits.map((b) => (
                <div key={b} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CheckCircle size={14} color="#4ade80" />
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{b}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 28, padding: "14px 16px", borderRadius: 10, background: "rgba(110,172,218,0.05)", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 2 }}>Total ({qty} item{qty > 1 ? "s" : ""})</p>
                <UsdcAmount value={total} iconSize={18} style={{ fontSize: 20, fontWeight: 700, color: "var(--sand)" }} />
              </div>
              <button type="button" className="btn-primary" onClick={() => setShowPurchase(true)} style={{ gap: 6 }}>
                <Wallet size={13} /> Buy with USDC
              </button>
            </div>
          </div>
        </div>
      </main>
      <MobileBottomNav />

      <PurchaseModal
        open={showPurchase}
        onClose={() => setShowPurchase(false)}
        onSuccess={(txHash) => {
          showToast("Purchase complete! Check your orders.");
          setShowPurchase(false);
        }}
        product={{
          id: String(product.id),
          title: product.name,
          price_usdc: parseFloat(product.price) * qty,
          seller_wallet: "0xB84183012d8e4Af0152aaB3D1F362f4E748B8F34",
          thumbnail_url: product.image || null,
        }}
      />
    </div>
  );
}

export default function DetailsPage() {
  return (
    <Suspense fallback={<div className="page-shell" style={{ minHeight: "100vh" }} />}>
      <DetailsContent />
    </Suspense>
  );
}
