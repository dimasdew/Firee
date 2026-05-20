"use client";

import { useEffect, useState } from "react";
import { Heart, Trash2, ShoppingCart, Package, Loader2 } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { getProduct } from "../../../lib/products";
import { createClient } from "../../../lib/supabase/client";
import UsdcAmount from "../../../components/UsdcAmount";
import Link from "next/link";
import type { DbProduct } from "../../../lib/supabase/types";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart, marketplaceWishlist, toggleMarketplaceWishlist, user } = useApp();
  const [mpProducts, setMpProducts] = useState<DbProduct[]>([]);
  const [mpLoading, setMpLoading] = useState(false);

  useEffect(() => {
    if (marketplaceWishlist.length === 0) { setMpProducts([]); return; }
    setMpLoading(true);
    const supabase = createClient();
    supabase
      .from("products")
      .select("*, seller:profiles(id, username, display_name), category:categories(*)")
      .in("id", marketplaceWishlist)
      .then(({ data }) => {
        setMpProducts(data ?? []);
        setMpLoading(false);
      });
  }, [marketplaceWishlist]);

  const items = wishlist
    .map((w) => ({ ...w, product: getProduct(w.productId) }))
    .filter((w) => w.product);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)", marginBottom: 4 }}>Wishlist</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Products you&apos;ve saved for later</p>
          </div>
          <span className="badge badge-sky" style={{ fontSize: 10 }}>{items.length} item{items.length !== 1 ? "s" : ""}</span>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Heart size={40} color="var(--sky)" style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 8 }}>Your wishlist is empty</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", opacity: 0.6 }}>Tap the heart icon on products to save them here</p>
            <Link href="/dashboard" className="btn-primary" style={{ marginTop: 20, display: "inline-flex", fontSize: 12 }}>
              Browse Products
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map(({ productId, product }) => (
              <div
                key={productId}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: 14, borderRadius: 10, border: "1px solid var(--border)",
                  background: "rgba(110,172,218,0.02)",
                }}
              >
                <div style={{ width: 48, height: 56, borderRadius: 6, background: "rgba(110,172,218,0.06)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                  {product!.image
                    ? <img src={product!.image} alt={product!.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    : <span style={{ fontSize: 22 }}>{product!.emoji}</span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/dashboard/details?id=${productId}`} style={{ fontSize: 13, fontWeight: 600, color: "var(--text, white)", textDecoration: "none" }}>
                    {product!.name}
                  </Link>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{product!.company}</p>
                  <UsdcAmount value={product!.price} showLabel={false} iconSize={11} style={{ fontSize: 12, fontWeight: 600, color: "var(--sand)", marginTop: 4 }} />
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => { addToCart(productId); toggleWishlist(productId); }}
                    className="btn-ghost"
                    style={{ padding: "6px 10px", fontSize: 11 }}
                    title="Move to cart"
                  >
                    <ShoppingCart size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(productId)}
                    className="btn-ghost"
                    style={{ padding: "6px 10px", fontSize: 11, color: "#f87171", borderColor: "rgba(248,113,113,0.2)" }}
                    title="Remove"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Marketplace Wishlist (Supabase-synced) */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)", marginBottom: 4 }}>Marketplace Wishlist</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Digital products saved from the marketplace</p>
          </div>
          <span className="badge badge-sand" style={{ fontSize: 10 }}>{mpProducts.length} item{mpProducts.length !== 1 ? "s" : ""}</span>
        </div>

        {mpLoading ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <Loader2 size={20} color="var(--sky)" style={{ margin: "0 auto", animation: "spin 1s linear infinite" }} />
          </div>
        ) : mpProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Package size={40} color="var(--sky)" style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 8 }}>No marketplace products saved</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", opacity: 0.6 }}>Tap the heart icon on marketplace products to save them</p>
            <Link href="/dashboard" className="btn-primary" style={{ marginTop: 20, display: "inline-flex", fontSize: 12 }}>
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {mpProducts.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: 14, borderRadius: 10, border: "1px solid var(--border)",
                  background: "rgba(110,172,218,0.02)",
                }}
              >
                <div style={{ width: 48, height: 56, borderRadius: 6, background: "rgba(110,172,218,0.06)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                  {p.thumbnail_url
                    ? <img src={p.thumbnail_url} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <Package size={18} color="var(--sky)" style={{ opacity: 0.5 }} />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/product/${p.id}`} style={{ fontSize: 13, fontWeight: 600, color: "var(--text, white)", textDecoration: "none" }}>
                    {p.title}
                  </Link>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    {p.seller?.display_name || p.seller?.username || "Seller"}
                  </p>
                  <UsdcAmount value={Number(p.price_usdc)} showLabel={false} iconSize={11} style={{ fontSize: 12, fontWeight: 600, color: "var(--sand)", marginTop: 4 }} />
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <Link
                    href={`/product/${p.id}`}
                    className="btn-ghost"
                    style={{ padding: "6px 10px", fontSize: 11, textDecoration: "none" }}
                    title="View product"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleMarketplaceWishlist(p.id)}
                    className="btn-ghost"
                    style={{ padding: "6px 10px", fontSize: 11, color: "#f87171", borderColor: "rgba(248,113,113,0.2)" }}
                    title="Remove"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
