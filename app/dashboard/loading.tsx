import ProductSkeleton from "../../components/ProductSkeleton";

export default function DashboardLoading() {
  return (
    <div className="page-shell">
      <div className="container" style={{ padding: "32px 0 48px" }}>
        <div style={{ marginBottom: 24 }}>
          <div className="skeleton" style={{ width: 80, height: 12, borderRadius: 4, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 180, height: 22, borderRadius: 6 }} />
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton" style={{ width: 64, height: 28, borderRadius: 6 }} />
          ))}
        </div>
        <ProductSkeleton count={8} />
      </div>
    </div>
  );
}
