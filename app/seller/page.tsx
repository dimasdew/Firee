"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PlusCircle, Edit, Trash2, Eye, EyeOff, Package, Loader2 } from "lucide-react";
import UsdcAmount from "../../components/UsdcAmount";
import { useApp } from "../../context/AppContext";
import { getSellerProducts, deleteProduct as deleteProductApi } from "../../lib/supabase/products";
import { createClient } from "../../lib/supabase/client";
import type { DbProduct } from "../../lib/supabase/types";

export default function SellerProductsPage() {
  const { showToast } = useApp();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const data = await getSellerProducts(user.id);
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteProductApi(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast("Product deleted");
    } catch {
      showToast("Failed to delete product");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stats overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Total Products</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text, white)" }}>{products.length}</p>
        </div>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Total Sales</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: "var(--sky)" }}>
            {products.reduce((s, p) => s + p.total_sales, 0)}
          </p>
        </div>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Revenue</p>
          <UsdcAmount
            value={products.reduce((s, p) => s + p.total_revenue_usdc, 0)}
            iconSize={16}
            style={{ fontSize: 20, fontWeight: 700, color: "var(--sand)", justifyContent: "center" }}
          />
        </div>
      </div>

      {/* Product list */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)" }}>My Products</h3>
          <Link href="/seller/new" className="btn-primary" style={{ fontSize: 12, padding: "8px 16px" }}>
            <PlusCircle size={14} /> Add Product
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <Loader2 size={24} color="var(--sky)" style={{ margin: "0 auto", animation: "spin 1s linear infinite" }} />
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <Package size={48} color="var(--sky)" style={{ margin: "0 auto 16px", opacity: 0.4 }} />
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 8 }}>No products yet</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", opacity: 0.6, marginBottom: 20 }}>
              Create your first digital product to start selling
            </p>
            <Link href="/seller/new" className="btn-primary" style={{ display: "inline-flex", fontSize: 12 }}>
              <PlusCircle size={14} /> Create Product
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {products.map((product) => (
              <div
                key={product.id}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: 14, borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "rgba(110,172,218,0.02)",
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: 56, height: 56, borderRadius: 8,
                  background: "rgba(110,172,218,0.08)",
                  border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, overflow: "hidden",
                }}>
                  {product.thumbnail_url
                    ? <img src={product.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <Package size={20} color="var(--sky)" style={{ opacity: 0.5 }} />
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text, white)" }}>{product.title}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                    <span className="badge badge-sky" style={{ fontSize: 9 }}>{product.category?.name ?? "Other"}</span>
                    <UsdcAmount value={Number(product.price_usdc)} showLabel={false} iconSize={11} style={{ fontSize: 12, fontWeight: 600, color: "var(--sand)" }} />
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{product.total_sales} sales</span>
                  </div>
                </div>

                {/* Status + Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span className={`badge ${product.is_published ? "badge-green" : "badge-sky"}`} style={{ fontSize: 9 }}>
                    {product.is_published ? <><Eye size={9} /> Live</> : <><EyeOff size={9} /> Draft</>}
                  </span>
                  <Link href={`/seller/edit/${product.id}`} className="icon-btn" aria-label="Edit">
                    <Edit size={14} />
                  </Link>
                  <button type="button" className="icon-btn danger" aria-label="Delete" onClick={() => handleDelete(product.id, product.title)}>
                    <Trash2 size={14} />
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
