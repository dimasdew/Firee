"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import ProductCard from "../../components/ProductCard";
import MarketplaceCard from "../../components/MarketplaceCard";
import MobileBottomNav from "../../components/MobileBottomNav";
import { PRODUCTS, CATEGORIES } from "../../lib/products";
import { getPublishedProducts, getCategories } from "../../lib/supabase/products";
import type { DbProduct, Category } from "../../lib/supabase/types";

type SortKey = "name" | "price-asc" | "price-desc";

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [sort, setSort] = useState<SortKey>("name");
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPublishedProducts(), getCategories()])
      .then(([products, cats]) => {
        setDbProducts(products);
        setDbCategories(cats);
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
    let list = dbProducts.filter((p) => {
      const catName = p.category?.name || "";
      const matchCat = activeCat === "All" || catName === activeCat;
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return a.price_usdc - b.price_usdc;
      if (sort === "price-desc") return b.price_usdc - a.price_usdc;
      return a.title.localeCompare(b.title);
    });
    return list;
  }, [dbProducts, search, activeCat, sort]);

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
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="cat-filters" style={{ marginBottom: 20 }}>
          {allCategories.map((cat) => (
            <button key={cat} type="button" className={`cat-btn ${activeCat === cat ? "active" : ""}`} onClick={() => setActiveCat(cat)}>
              {cat}
            </button>
          ))}
        </div>

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
                  <MarketplaceCard product={p} />
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
