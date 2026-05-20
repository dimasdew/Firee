"use client";

import { useEffect, useState, useCallback } from "react";
import { TrendingUp, ShoppingCart, Star, Package, Loader2 } from "lucide-react";
import UsdcAmount from "../../../components/UsdcAmount";
import { StarDisplay } from "../../../components/ReviewSection";
import { getSellerProducts } from "../../../lib/supabase/products";
import { getSellerOrders } from "../../../lib/supabase/orders";
import { getMultipleProductRatings } from "../../../lib/supabase/reviews";
import { createClient } from "../../../lib/supabase/client";
import { timeAgo } from "../../../lib/utils";
import type { DbProduct, DbOrder } from "../../../lib/supabase/types";

export default function AnalyticsPage() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const [prods, ords] = await Promise.all([
        getSellerProducts(user.id),
        getSellerOrders(user.id),
      ]);
      setProducts(prods);
      setOrders(ords);
      if (prods.length > 0) {
        const ids = prods.map((p) => p.id);
        const ratingsMap = await getMultipleProductRatings(ids);
        setRatings(ratingsMap);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const totalSales = products.reduce((s, p) => s + p.total_sales, 0);
  const totalRevenue = products.reduce((s, p) => s + p.total_revenue_usdc, 0);
  const allRatings = Object.values(ratings);
  const avgRating = allRatings.length > 0
    ? allRatings.reduce((s, r) => s + r.avg * r.count, 0) / Math.max(allRatings.reduce((s, r) => s + r.count, 0), 1)
    : 0;
  const totalReviews = allRatings.reduce((s, r) => s + r.count, 0);

  // Top products by sales
  const topProducts = [...products]
    .sort((a, b) => b.total_sales - a.total_sales || b.total_revenue_usdc - a.total_revenue_usdc)
    .slice(0, 5);

  // Recent orders
  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <Loader2 size={24} color="var(--sky)" style={{ margin: "0 auto", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(110,172,218,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Package size={15} color="var(--sky)" />
            </div>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Products</span>
          </div>
          <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text, white)" }}>{products.length}</p>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(226,226,182,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingCart size={15} color="var(--sand)" />
            </div>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Total Sales</span>
          </div>
          <p style={{ fontSize: 24, fontWeight: 700, color: "var(--sky)" }}>{totalSales}</p>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(226,226,182,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={15} color="var(--sand)" />
            </div>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Revenue</span>
          </div>
          <UsdcAmount value={totalRevenue} iconSize={16} style={{ fontSize: 20, fontWeight: 700, color: "var(--sand)" }} />
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(250,204,21,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Star size={15} color="#facc15" />
            </div>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Avg Rating</span>
          </div>
          {totalReviews > 0 ? (
            <StarDisplay avg={avgRating} count={totalReviews} size={16} />
          ) : (
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No reviews yet</p>
          )}
        </div>
      </div>

      <div className="analytics-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Top Products */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)", marginBottom: 16 }}>Top Products</h3>
          {topProducts.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>No products yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topProducts.map((p, i) => (
                <div key={p.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 8,
                  border: "1px solid var(--border)",
                }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: i === 0 ? "rgba(250,204,21,0.15)" : "rgba(110,172,218,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700,
                    color: i === 0 ? "#facc15" : "var(--text-muted)",
                  }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text, white)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.total_sales} sales</span>
                      {ratings[p.id] && ratings[p.id].count > 0 && (
                        <StarDisplay avg={ratings[p.id].avg} count={ratings[p.id].count} size={10} />
                      )}
                    </div>
                  </div>
                  <UsdcAmount value={p.total_revenue_usdc} showLabel={false} iconSize={11} style={{ fontSize: 13, fontWeight: 600, color: "var(--sand)" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)", marginBottom: 16 }}>Recent Sales</h3>
          {recentOrders.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>No sales yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentOrders.map((order) => (
                <div key={order.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", borderRadius: 8,
                  border: "1px solid var(--border)",
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text, white)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {order.buyer?.display_name || order.buyer?.username || "Buyer"}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {order.product?.title || "Product"}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                    <UsdcAmount value={order.price_usdc} showLabel={false} iconSize={11} style={{ fontSize: 13, fontWeight: 600, color: "var(--sand)" }} />
                    <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{timeAgo(order.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
