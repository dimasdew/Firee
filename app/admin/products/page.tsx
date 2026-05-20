"use client";

import { useEffect, useState, useCallback } from "react";
import { adminGetAllProducts, adminDeleteProduct, adminToggleProductPublish } from "../../../lib/supabase/admin";
import { useApp } from "../../../context/AppContext";
import type { DbProduct } from "../../../lib/supabase/types";
import { Loader2, Trash2, Eye, EyeOff, Search, Package } from "lucide-react";
import UsdcAmount from "../../../components/UsdcAmount";
import { timeAgo } from "../../../lib/utils";

export default function AdminProductsPage() {
  const { showToast } = useApp();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadProducts = useCallback(async () => {
    try {
      const data = await adminGetAllProducts();
      setProducts(data);
    } catch (err: any) {
      showToast(err?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await adminDeleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast("Product deleted");
    } catch {
      showToast("Failed to delete product");
    }
  };

  const handleTogglePublish = async (id: string, currentlyPublished: boolean) => {
    try {
      await adminToggleProductPublish(id, !currentlyPublished);
      setProducts((prev) =>
        prev.map((p) => p.id === id ? { ...p, is_published: !currentlyPublished } : p)
      );
      showToast(currentlyPublished ? "Product unpublished" : "Product published");
    } catch {
      showToast("Failed to update product");
    }
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.seller?.display_name || "").toLowerCase().includes(q) ||
      (p.seller?.username || "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "64px 0" }}>
        <Loader2 size={24} color="var(--sky)" style={{ margin: "0 auto", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ padding: 16, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Total Products</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text, white)" }}>{products.length}</p>
        </div>
        <div className="card" style={{ padding: 16, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Published</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: "#4ade80" }}>{products.filter((p) => p.is_published).length}</p>
        </div>
        <div className="card" style={{ padding: 16, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Drafts</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text-muted)" }}>{products.filter((p) => !p.is_published).length}</p>
        </div>
        <div className="card" style={{ padding: 16, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Total Sales</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: "var(--sky)" }}>{products.reduce((s, p) => s + p.total_sales, 0)}</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          className="input"
          placeholder="Search products or seller..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 34 }}
        />
      </div>

      {/* Product list */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Product</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Seller</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Price</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Sales</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: "rgba(110,172,218,0.06)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                        {p.thumbnail_url
                          ? <img src={p.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <Package size={14} color="var(--sky)" style={{ opacity: 0.5 }} />
                        }
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 600, color: "var(--text, white)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{timeAgo(p.created_at)}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--text-muted)" }}>
                    {p.seller?.display_name || p.seller?.username || "—"}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <UsdcAmount value={Number(p.price_usdc)} iconSize={11} style={{ fontSize: 12, fontWeight: 600, color: "var(--sand)", justifyContent: "center" }} />
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center", color: "var(--text-muted)" }}>{p.total_sales}</td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <span className={`badge ${p.is_published ? "badge-green" : "badge-sky"}`} style={{ fontSize: 9 }}>
                      {p.is_published ? "Live" : "Draft"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                      <button
                        type="button"
                        className="icon-btn"
                        title={p.is_published ? "Unpublish" : "Publish"}
                        onClick={() => handleTogglePublish(p.id, p.is_published)}
                      >
                        {p.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button
                        type="button"
                        className="icon-btn danger"
                        title="Delete"
                        onClick={() => handleDelete(p.id, p.title)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No products found</p>
        )}
      </div>
    </div>
  );
}
