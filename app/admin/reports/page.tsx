"use client";

import { useEffect, useState, useCallback } from "react";
import { adminGetAllReports, adminUpdateReportStatus, type AdminReport } from "../../../lib/supabase/admin";
import { useApp } from "../../../context/AppContext";
import { Loader2, Flag, CheckCircle, XCircle, Eye, Package } from "lucide-react";
import { timeAgo } from "../../../lib/utils";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  pending: "badge-sand",
  reviewed: "badge-sky",
  resolved: "badge-green",
  dismissed: "",
};

const REASON_LABELS: Record<string, string> = {
  copyright: "Copyright / IP",
  malware: "Malware",
  scam: "Scam",
  inappropriate: "Inappropriate",
  other: "Other",
};

export default function AdminReportsPage() {
  const { showToast } = useApp();
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = useCallback(async () => {
    try {
      setReports(await adminGetAllReports());
    } catch {
      showToast("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (id: string, status: string) => {
    try {
      await adminUpdateReportStatus(id, status);
      setReports((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
      showToast(`Report ${status}`);
    } catch {
      showToast("Failed to update report");
    }
  };

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);

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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 20 }}>
        {["all", "pending", "reviewed", "resolved", "dismissed"].map((s) => {
          const count = s === "all" ? reports.length : reports.filter((r) => r.status === s).length;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className="card"
              style={{
                padding: 14, textAlign: "center", cursor: "pointer",
                border: filter === s ? "1px solid var(--sky)" : "1px solid var(--border)",
              }}
            >
              <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "capitalize", marginBottom: 4 }}>{s}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: s === "pending" && count > 0 ? "#f87171" : "var(--text, white)" }}>{count}</p>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Product</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Reason</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Reporter</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Date</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 14px" }}>
                    <Link href={`/product/${r.product_id}`} style={{ color: "var(--sky)", textDecoration: "none", fontWeight: 600, fontSize: 12 }}>
                      {r.product?.title || r.product_id.slice(0, 8)}
                    </Link>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span className="badge badge-sand" style={{ fontSize: 9 }}>{REASON_LABELS[r.reason] || r.reason}</span>
                    {r.details && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.details}</p>}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--text-muted)" }}>
                    {r.reporter?.display_name || r.reporter?.username || r.reporter_id.slice(0, 8)}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <span className={`badge ${STATUS_COLORS[r.status] || ""}`} style={{ fontSize: 9 }}>{r.status}</span>
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center", fontSize: 11, color: "var(--text-muted)" }}>
                    {timeAgo(r.created_at)}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    {r.status === "pending" && (
                      <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                        <button type="button" className="btn-ghost" style={{ fontSize: 10, padding: "3px 8px", color: "var(--sky)" }} onClick={() => handleStatus(r.id, "reviewed")}>
                          <Eye size={10} /> Review
                        </button>
                        <button type="button" className="btn-ghost" style={{ fontSize: 10, padding: "3px 8px", color: "var(--sand)" }} onClick={() => handleStatus(r.id, "resolved")}>
                          <CheckCircle size={10} /> Resolve
                        </button>
                        <button type="button" className="btn-ghost" style={{ fontSize: 10, padding: "3px 8px", color: "var(--text-muted)" }} onClick={() => handleStatus(r.id, "dismissed")}>
                          <XCircle size={10} /> Dismiss
                        </button>
                      </div>
                    )}
                    {r.status === "reviewed" && (
                      <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                        <button type="button" className="btn-ghost" style={{ fontSize: 10, padding: "3px 8px", color: "var(--sand)" }} onClick={() => handleStatus(r.id, "resolved")}>
                          <CheckCircle size={10} /> Resolve
                        </button>
                        <button type="button" className="btn-ghost" style={{ fontSize: 10, padding: "3px 8px", color: "var(--text-muted)" }} onClick={() => handleStatus(r.id, "dismissed")}>
                          <XCircle size={10} /> Dismiss
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center" }}>
            <Flag size={24} color="var(--text-muted)" style={{ margin: "0 auto 8px", opacity: 0.3 }} />
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No reports found</p>
          </div>
        )}
      </div>
    </div>
  );
}
