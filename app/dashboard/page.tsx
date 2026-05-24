"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../../components/Navbar";
import MarketplaceCard from "../../components/MarketplaceCard";
import MobileBottomNav from "../../components/MobileBottomNav";
import ProductSkeleton from "../../components/ProductSkeleton";
import { searchProducts, getCategories, getPublishedProducts } from "../../lib/supabase/products";
import { getMultipleProductRatings } from "../../lib/supabase/reviews";
import type { DbProduct, Category } from "../../lib/supabase/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

type SortKey = "name" | "price-asc" | "price-desc" | "rating" | "newest";
const PAGE_SIZE = 12;

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [sort, setSort] = useState<SortKey>("newest");
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});
  const [loading, setLoading] = useState(true);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [allTags, setAllTags] = useState<string[]>([]);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load categories + tags once
  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    // Fetch all products once just for tags extraction
    getPublishedProducts().then((all) => {
      const tags = new Set<string>();
      all.forEach((p) => p.tags?.forEach((t) => tags.add(t)));
      setAllTags(Array.from(tags).sort());
    }).catch(() => {});
  }, []);

  // Fetch products with search/filter/pagination
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await searchProducts({
        search,
        category: activeCat,
        tag: activeTag ?? undefined,
        priceMin: priceMin ? parseFloat(priceMin) : undefined,
        priceMax: priceMax ? parseFloat(priceMax) : undefined,
        sort,
        page,
        pageSize: PAGE_SIZE,
      });
      setProducts(result.products);
      setTotalCount(result.total);
      setTotalPages(result.totalPages);

      // Fetch ratings for this page
      if (result.products.length > 0) {
        const ids = result.products.map((p) => p.id);
        const ratingsMap = await getMultipleProductRatings(ids);
        setRatings(ratingsMap);
      } else {
        setRatings({});
      }
    } catch {
      setProducts([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [search, activeCat, sort, priceMin, priceMax, activeTag, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Reset page when filters change
  const resetPage = useCallback(() => setPage(1), []);

  // Debounced search from Navbar
  const handleSearch = useCallback((val: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(val);
      resetPage();
    }, 350);
  }, [resetPage]);

  const allCategories = useMemo(() => {
    return ["All", ...categories.map((c) => c.name)];
  }, [categories]);

  // Client-side re-sort for rating (not available in Supabase)
  const displayProducts = useMemo(() => {
    if (sort === "rating") {
      return [...products].sort((a, b) => (ratings[b.id]?.avg || 0) - (ratings[a.id]?.avg || 0));
    }
    return products;
  }, [products, sort, ratings]);

  return (
    <div className="page-shell">
      <Navbar variant="dashboard" onSearch={handleSearch} />

      <main className="container" style={{ padding: "32px 0 48px" }}>
        <div className="dashboard-header">
          <div>
            <p style={{ fontSize: 11, color: "rgba(110,172,218,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Marketplace</p>
            <h1 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(20px, 4vw, 26px)", color: "var(--text, white)", letterSpacing: "-0.02em" }}>
              Browse Products
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <select className="sort-select" value={sort} onChange={(e) => { setSort(e.target.value as SortKey); resetPage(); }} aria-label="Sort products">
              <option value="newest">Sort: Newest</option>
              <option value="name">Sort: Name</option>
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
            <button key={cat} type="button" className={`cat-btn ${activeCat === cat ? "active" : ""}`} onClick={() => { setActiveCat(cat); resetPage(); }}>
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
                value={priceMin} onChange={(e) => { setPriceMin(e.target.value); resetPage(); }}
                style={{
                  width: 72, padding: "6px 8px", fontSize: 12, borderRadius: 6,
                  border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)",
                  color: "var(--text, white)",
                }}
              />
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>–</span>
              <input
                type="number" min="0" step="0.01" placeholder="Max"
                value={priceMax} onChange={(e) => { setPriceMax(e.target.value); resetPage(); }}
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
                    onClick={() => { setActiveTag(activeTag === tag ? null : tag); resetPage(); }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
            {(priceMin || priceMax || activeTag) && (
              <button
                type="button"
                onClick={() => { setPriceMin(""); setPriceMax(""); setActiveTag(null); resetPage(); }}
                style={{ fontSize: 11, color: "var(--sky)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        <div className="glow-line" style={{ marginBottom: 24 }} />

        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
          {loading ? "Searching..." : `${totalCount} product${totalCount !== 1 ? "s" : ""} found`}
          {!loading && totalPages > 1 && (
            <span style={{ marginLeft: 8, opacity: 0.6 }}>· Page {page} of {totalPages}</span>
          )}
        </p>

        {loading ? (
          <ProductSkeleton count={PAGE_SIZE} />
        ) : displayProducts.length > 0 ? (
          <div className="products-grid">
            {displayProducts.map((p, i) => (
              <div key={p.id} className="fade-up" style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
                <MarketplaceCard product={p} rating={ratings[p.id]} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: 40, marginBottom: 12, opacity: 0.2 }}>🔍</p>
            <p style={{ fontSize: 15, color: "var(--text-muted)", fontWeight: 500 }}>No products found</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, opacity: 0.7 }}>Try a different search or category</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 32 }}>
            <button
              type="button"
              className="btn-ghost"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{ padding: "8px 12px", fontSize: 12, opacity: page <= 1 ? 0.3 : 1 }}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | "...")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} style={{ fontSize: 12, color: "var(--text-muted)", padding: "0 4px" }}>…</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p as number)}
                    style={{
                      width: 32, height: 32, borderRadius: 8, fontSize: 12, fontWeight: 600,
                      border: page === p ? "1px solid var(--sky)" : "1px solid var(--border)",
                      background: page === p ? "rgba(110,172,218,0.15)" : "transparent",
                      color: page === p ? "var(--sky)" : "var(--text-muted)",
                      cursor: "pointer",
                    }}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              type="button"
              className="btn-ghost"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{ padding: "8px 12px", fontSize: 12, opacity: page >= totalPages ? 0.3 : 1 }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
}
