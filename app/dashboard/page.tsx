"use client";

import { useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import ProductCard from "../../components/ProductCard";
import MobileBottomNav from "../../components/MobileBottomNav";
import { PRODUCTS, CATEGORIES } from "../../lib/products";

type SortKey = "name" | "price-asc" | "price-desc";

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [sort, setSort] = useState<SortKey>("name");

  const filtered = useMemo(() => {
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
          {CATEGORIES.map((cat) => (
            <button key={cat} type="button" className={`cat-btn ${activeCat === cat ? "active" : ""}`} onClick={() => setActiveCat(cat)}>
              {cat}
            </button>
          ))}
        </div>

        <div className="glow-line" style={{ marginBottom: 24 }} />

        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
          {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
        </p>

        {filtered.length > 0 ? (
          <div className="products-grid">
            {filtered.map((p, i) => (
              <div key={p.id} className="fade-up" style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
                <ProductCard {...p} />
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
      </main>

      <MobileBottomNav />
    </div>
  );
}
