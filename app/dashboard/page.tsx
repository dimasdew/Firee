"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import ProductCard from "../../components/ProductCard";
import MarketplaceCard from "../../components/MarketplaceCard";
import MobileBottomNav from "../../components/MobileBottomNav";
import { PRODUCTS, CATEGORIES } from "../../lib/products";
import { getPublishedProducts, getCategories } from "../../lib/supabase/products";
import { getMultipleProductRatings } from "../../lib/supabase/reviews";
import type { DbProduct, Category } from "../../lib/supabase/types";

type SortKey = "name" | "price-asc" | "price-desc" | "rating" | "newest";

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [sort, setSort] = useState<SortKey>("name");
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});
  const [loading, setLoading] = useState(true);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    Promise.all([getPublishedProducts(), getCategories()])
      .then(async ([products, cats]) => {
        setDbProducts(products);
        setDbCategories(cats);
        if (products.length > 0) {
          const ids = products.map((p) => p.id);
          const ratingsMap = await getMultipleProductRatings(ids);
          setRatings(ratingsMap);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Merge mock categories with DB categories
  const allCategories = useMemo(() => {
    const dbCatNames = dbCategories.map((c) => c.name);
    const mockCats = CATEGORIES.filter((c) => c !== "All");
    const merged = ["All", ...new Set([...dbCatNames, ...mockCats])];
    return merged;
  }, [dbCategories]);

  // Collect all unique tags from DB products
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    dbProducts.forEach((p) => p.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [dbProducts]);

  // Filter mock products
  const filteredMock = useMemo(() => {
    let list = PRODUCTS.filter((p) => {
      const matchCat = activeCat === "All" || p.category === activeCat;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return parseFloat(a.price) - parseFloat(b.price);
      if (sort === "price-desc") return parseFloat(b.price) - parseFloat(a.price);
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [search, activeCat, sort]);

  // Filter real products
  const filteredDb = useMemo(() => {
    const minP = priceMin ? parseFloat(priceMin) : 0;
    const maxP = priceMax ? parseFloat(priceMax) : Infinity;
    let list = dbProducts.filter((p) => {
      const catName = p.category?.name || "";
      const matchCat = activeCat === "All" || catName === activeCat;
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
        || (p.description?.toLowerCase().includes(search.toLowerCase()))
        || (p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase())));
      const matchPrice = p.price_usdc >= minP && p.price_usdc <= maxP;
      const matchTag = !activeTag || p.tags?.includes(activeTag);
      return matchCat && matchSearch && matchPrice && matchTag;
    });
    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return a.price_usdc - b.price_usdc;
      if (sort === "price-desc") return b.price_usdc - a.price_usdc;
      if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "rating") {
        const ra = ratings[a.id]?.avg || 0;
        const rb = ratings[b.id]?.avg || 0;
        return rb - ra;
      }
      return a.title.localeCompare(b.title);
    });
    return list;
  }, [dbProducts, search, activeCat, sort, priceMin, priceMax, activeTag, ratings]);

  const totalCount = filteredDb.length + filteredMock.length;

  return (
    <div className="page-shell">
      <Navbar variant="dashboard" onSearch={setSearch} />

      <main className="container" style={{ padding: "32px 0 48px" }}>
        <div className="dashboard-header">
          <div>
            <p style={{ fontSize: 11, color: "rgba(110,172,218,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Marketplace</p>
            <h1 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(20px, 4vw, 26px)", color: "var(--text, white)", letterSpacing: "-0.02em" }}>
              Browse Products
              {search && <span style={{ fontSize: 14, fontWeight: 400, color: "var(--text-muted)", marginLeft: 8 }}>"{search}"</span>}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort products">
              <option value="name">Sort: Name</option>
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Sort: Top Rated</option>
            </select>
            <button
              type="button"
              className={`icon-btn ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Toggle filters"
              style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border)", background: showFilters ? "rgba(110,172,218,0.12)" : "transparent" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>
            </button>
          </div>
        </div>

        <div className="cat-filters" style={{ marginBottom: 20 }}>
          {allCategories.map((cat) => (
            <button key={cat} type="button" className={`cat-btn ${activeCat === cat ? "active" : ""}`} onClick={() => setActiveCat(cat)}>
              {cat}
            </button>
          ))}
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16,
            padding: 16, borderRadius: 10,
            border: "1px solid var(--border)", background: "rgba(110,172,218,0.03)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <label style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>Price</label>
              <input
                type="number" min="0" step="0.01" placeholder="Min"
                value={priceMin} onChange={(e) => setPriceMin(e.target.value)}
                style={{
                  width: 72, padding: "6px 8px", fontSize: 12, borderRadius: 6,
                  border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)",
                  color: "var(--text, white)",
                }}
              />
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>–</span>
              <input
                type="number" min="0" step="0.01" placeholder="Max"
                value={priceMax} onChange={(e) => setPriceMax(e.target.value)}
                style={{
                  width: 72, padding: "6px 8px", fontSize: 12, borderRadius: 6,
                  border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)",
                  color: "var(--text, white)",
                }}
              />
            </div>
            {allTags.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Tags</label>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`badge ${activeTag === tag ? "badge-green" : "badge-sky"}`}
                    style={{ fontSize: 10, cursor: "pointer", padding: "3px 8px" }}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
            {(priceMin || priceMax || activeTag) && (
              <button
                type="button"
                onClick={() => { setPriceMin(""); setPriceMax(""); setActiveTag(null); }}
                style={{ fontSize: 11, color: "var(--sky)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        <div className="glow-line" style={{ marginBottom: 24 }} />

        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
          {loading ? "Loading..." : `${totalCount} product${totalCount !== 1 ? "s" : ""} found`}
        </p>

        {/* Real Supabase products */}
        {filteredDb.length > 0 && (
          <>
            {filteredMock.length > 0 && (
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--sky)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Digital Products
              </p>
            )}
            <div className="products-grid" style={{ marginBottom: 28 }}>
              {filteredDb.map((p, i) => (
                <div key={p.id} className="fade-up" style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
                  <MarketplaceCard product={p} rating={ratings[p.id]} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Mock products */}
        {filteredMock.length > 0 && (
          <>
            {filteredDb.length > 0 && (
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Demo Products
              </p>
            )}
            <div className="products-grid">
              {filteredMock.map((p, i) => (
                <div key={p.id} className="fade-up" style={{ animationDelay: `${(filteredDb.length + i) * 0.04}s`, opacity: 0 }}>
                  <ProductCard {...p} />
                </div>
              ))}
            </div>
          </>
        )}

        {totalCount === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: 40, marginBottom: 12, opacity: 0.2 }}>🔍</p>
            <p style={{ fontSize: 15, color: "var(--text-muted)", fontWeight: 500 }}>No products found</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, opacity: 0.7 }}>Try a different search or category</p>
          </div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
}
