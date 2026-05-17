export default function ProductSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="products-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
            <div className="skeleton" style={{ width: 56, height: 16, borderRadius: 8 }} />
          </div>
          <div style={{ padding: "16px 14px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 6, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: 72, height: 88, borderRadius: 8, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: 60, height: 14, borderRadius: 6 }} />
          </div>
          <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
            <div className="skeleton" style={{ flex: 1, height: 32, borderRadius: 6 }} />
            <div className="skeleton" style={{ width: 36, height: 32, borderRadius: 6 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
