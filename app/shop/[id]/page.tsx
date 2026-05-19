"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import MobileBottomNav from "../../../components/MobileBottomNav";
import MarketplaceCard from "../../../components/MarketplaceCard";
import { StarDisplay } from "../../../components/ReviewSection";
import { getProfile } from "../../../lib/supabase/auth";
import { getSellerPublishedProducts } from "../../../lib/supabase/products";
import { getMultipleProductRatings } from "../../../lib/supabase/reviews";
import type { Profile } from "../../../lib/supabase/types";
import type { DbProduct } from "../../../lib/supabase/types";
import { ArrowLeft, User, Package, ShoppingBag, Loader2 } from "lucide-react";

export default function SellerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const sellerId = params.id as string;

  const [seller, setSeller] = useState<Profile | null>(null);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) return;
    Promise.all([getProfile(sellerId), getSellerPublishedProducts(sellerId)])
      .then(async ([profile, prods]) => {
        if (!profile) { router.push("/dashboard"); return; }
        setSeller(profile);
        setProducts(prods);
        if (prods.length > 0) {
          const ids = prods.map((p) => p.id);
          const ratingsMap = await getMultipleProductRatings(ids);
          setRatings(ratingsMap);
        }
      })
      .catch(() => router.push("/dashboard"))
      .finally(() => setLoading(false));
  }, [sellerId, router]);

  // Compute overall seller rating from all product ratings
  const overallRating = (() => {
    const entries = Object.values(ratings);
    if (entries.length === 0) return { avg: 0, count: 0 };
    const totalCount = entries.reduce((s, r) => s + r.count, 0);
    const totalSum = entries.reduce((s, r) => s + r.avg * r.count, 0);
    return { avg: totalCount > 0 ? totalSum / totalCount : 0, count: totalCount };
  })();

  const totalSales = products.reduce((s, p) => s + p.total_sales, 0);

  if (loading) {
    return (
      <div className="page-shell">
        <Navbar variant="dashboard" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "var(--sky)" }} />
        </div>
      </div>
    );
  }

  if (!seller) return null;

  return (
    <div className="page-shell">
      <Navbar variant="dashboard" />
      <main className="container" style={{ padding: "28px 0 48px" }}>
        <Link href="/dashboard" className="back-link">
          <ArrowLeft size={14} /> Back to Marketplace
        </Link>

        {/* Seller header */}
        <div className="card" style={{ padding: 28, marginBottom: 24, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(110,172,218,0.1)", border: "2px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", flexShrink: 0,
          }}>
            {seller.avatar_url
              ? <img src={seller.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <User size={28} color="var(--text-muted)" />
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 22, color: "var(--text, white)", marginBottom: 4 }}>
              {seller.display_name || seller.username}
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
              @{seller.username}
              {seller.seller_verified && (
                <span style={{ marginLeft: 8, fontSize: 11, color: "#4ade80" }}>✓ Verified Seller</span>
              )}
            </p>
            {seller.bio && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 8 }}>{seller.bio}</p>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Package size={13} color="var(--sky)" />
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{products.length} products</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <ShoppingBag size={13} color="var(--sand)" />
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{totalSales} sales</span>
              </div>
              {overallRating.count > 0 && (
                <StarDisplay avg={overallRating.avg} count={overallRating.count} size={13} />
              )}
            </div>
          </div>
        </div>

        {/* Products */}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text, white)", marginBottom: 16 }}>
          Products by {seller.display_name || seller.username}
        </h2>

        {products.length === 0 ? (
          <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
            <Package size={40} color="var(--sky)" style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No products yet</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p, i) => (
              <div key={p.id} className="fade-up" style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
                <MarketplaceCard product={p} rating={ratings[p.id]} />
              </div>
            ))}
          </div>
        )}
      </main>
      <MobileBottomNav />
    </div>
  );
}
