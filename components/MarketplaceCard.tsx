"use client";

import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";
import UsdcAmount from "./UsdcAmount";
import { StarDisplay } from "./ReviewSection";
import { useApp } from "../context/AppContext";
import type { DbProduct } from "../lib/supabase/types";

interface Props {
  product: DbProduct;
  rating?: { avg: number; count: number };
}

export default function MarketplaceCard({ product, rating }: Props) {
  const { isMarketplaceWishlisted, toggleMarketplaceWishlist } = useApp();
  const wishlisted = isMarketplaceWishlisted(product.id);

  return (
    <article className="card card-lift" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href={`/shop/${product.seller_id}`} style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%", textDecoration: "none" }}>
          {product.seller?.display_name || product.seller?.username || "Seller"}
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); toggleMarketplaceWishlist(product.id); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={13} fill={wishlisted ? "#f87171" : "none"} color={wishlisted ? "#f87171" : "var(--text-muted)"} />
          </button>
          <span className="badge badge-sky" style={{ fontSize: 9, padding: "2px 7px" }}>
            {product.category?.name || "Digital"}
          </span>
        </div>
      </div>

      <div style={{ padding: "16px 14px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ width: "100%", height: 120, borderRadius: 8, background: "rgba(110,172,218,0.06)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 12, overflow: "hidden" }}>
          {product.thumbnail_url
            ? <img src={product.thumbnail_url} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <ShoppingBag size={28} color="var(--sky)" style={{ opacity: 0.3 }} />
          }
        </div>
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: "var(--text, white)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
          {product.title}
        </p>
        {product.short_description && (
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
            {product.short_description}
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto" }}>
          <UsdcAmount value={product.price_usdc} showLabel={false} iconSize={13} style={{ color: "var(--sand)", fontWeight: 600, fontSize: 13 }} />
          {product.total_sales > 0 && (
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
              · {product.total_sales} sold
            </span>
          )}
        </div>
        {rating && rating.count > 0 && (
          <div style={{ marginTop: 4 }}>
            <StarDisplay avg={rating.avg} count={rating.count} size={11} />
          </div>
        )}
      </div>

      <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
        <Link
          href={`/product/${product.id}`}
          style={{ flex: 1, textAlign: "center", padding: 8, borderRadius: 6, background: "rgba(226,226,182,0.08)", border: "1px solid rgba(226,226,182,0.15)", color: "var(--sand)", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
        >
          View
        </Link>
      </div>
    </article>
  );
}
