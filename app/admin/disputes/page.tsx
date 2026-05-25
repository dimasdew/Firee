"use client";

import { useEffect, useState, useCallback } from "react";
import { adminGetAllDisputes, adminUpdateDispute, type AdminDispute } from "../../../lib/supabase/admin";
import { useApp } from "../../../context/AppContext";
import { Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { timeAgo } from "../../../lib/utils";

export default function AdminDisputesPage() {
  const { showToast } = useApp();
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [noteModal, setNoteModal] = useState<{ id: string; action: string } | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const load = useCallback(async () => {
    try {
      setDisputes(await adminGetAllDisputes());
    } catch {
      showToast("Failed to load disputes");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id: string, status: string, note?: string) => {
    try {
      await adminUpdateDispute(id, status, note);
      setDisputes((prev) => prev.map((d) => d.id === id ? { ...d, status, admin_note: note || d.admin_note } : d));
      setNoteModal(null);
      setAdminNote("");
      showToast(`Dispute ${status}`);
    } catch {
      showToast("Failed to update dispute");
    }
  };

  const filtered = filter === "all" ? disputes : disputes.filter((d) => d.status === filter);

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
        {["all", "pending", "approved", "rejected"].map((s) => {
          const count = s === "all" ? disputes.length : disputes.filter((d) => d.status === s).length;
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
              <p style={{ fontSize: 20, fontWeight: 700, color: s === "pending" && count > 0 ? "#fbbf24" : "var(--text, white)" }}>{count}</p>
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
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Buyer</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Seller</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Reason</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Date</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--text, white)" }}>
                    {d.buyer?.display_name || d.buyer?.username || d.buyer_id.slice(0, 8)}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--text-muted)" }}>
                    {d.seller?.display_name || d.seller?.username || d.seller_id.slice(0, 8)}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--text-muted)", maxWidth: 250 }}>
                    <p style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.reason}</p>
                    {d.admin_note && (
                      <p style={{ fontSize: 10, color: "var(--sky)", marginTop: 2 }}>Note: {d.admin_note}</p>
                    )}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <span className={`badge ${d.status === "pending" ? "badge-sand" : d.status === "approved" ? "badge-green" : "badge-sky"}`} style={{ fontSize: 9 }}>
                      {d.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center", fontSize: 11, color: "var(--text-muted)" }}>
                    {timeAgo(d.created_at)}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    {d.status === "pending" && (
                      <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                        <button type="button" className="btn-ghost" style={{ fontSize: 10, padding: "3px 8px", color: "var(--sand)" }}
                          onClick={() => { setNoteModal({ id: d.id, action: "approved" }); setAdminNote(""); }}>
                          <CheckCircle size={10} /> Approve
                        </button>
                        <button type="button" className="btn-ghost" style={{ fontSize: 10, padding: "3px 8px", color: "#f87171" }}
                          onClick={() => { setNoteModal({ id: d.id, action: "rejected" }); setAdminNote(""); }}>
                          <XCircle size={10} /> Reject
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
            <AlertCircle size={24} color="var(--text-muted)" style={{ margin: "0 auto 8px", opacity: 0.3 }} />
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No disputes found</p>
          </div>
        )}
      </div>

      {/* Admin Note Modal */}
      {noteModal && (
        <div className="modal-overlay" onClick={() => setNoteModal(null)}>
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ padding: 28, maxWidth: 420, width: "90%", margin: "auto" }}>
            <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 16, color: "var(--text, white)", marginBottom: 12 }}>
              {noteModal.action === "approved" ? "Approve Refund" : "Reject Refund"}
            </h3>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Admin Note (optional)</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Add a note for the buyer..."
              rows={3}
              style={{
                width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 8,
                border: "1px solid var(--border)", background: "rgba(0,0,0,0.3)",
                color: "var(--text, white)", resize: "vertical", marginBottom: 20,
              }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" className="btn-ghost" onClick={() => setNoteModal(null)} style={{ fontSize: 12 }}>Cancel</button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleAction(noteModal.id, noteModal.action, adminNote || undefined)}
                style={{ fontSize: 12, background: noteModal.action === "approved" ? "var(--sand)" : "#ef4444", borderColor: noteModal.action === "approved" ? "var(--sand)" : "#ef4444" }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
