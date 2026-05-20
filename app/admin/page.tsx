"use client";

import { useEffect, useState, useCallback } from "react";
import { adminGetAllUsers, adminToggleBan } from "../../lib/supabase/admin";
import { useApp } from "../../context/AppContext";
import type { Profile } from "../../lib/supabase/types";
import { Loader2, Ban, CheckCircle, User, Store, Shield, Search } from "lucide-react";
import { timeAgo } from "../../lib/utils";

export default function AdminUsersPage() {
  const { showToast } = useApp();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      const data = await adminGetAllUsers();
      setUsers(data);
    } catch (err: any) {
      showToast(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleToggleBan = async (userId: string, currentlyBanned: boolean) => {
    const action = currentlyBanned ? "unban" : "ban";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      await adminToggleBan(userId, !currentlyBanned);
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, is_banned: !currentlyBanned } : u)
      );
      showToast(`User ${action}ned`);
    } catch {
      showToast(`Failed to ${action} user`);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      (u.display_name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q)
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
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Total Users</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text, white)" }}>{users.length}</p>
        </div>
        <div className="card" style={{ padding: 16, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Sellers</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: "var(--sky)" }}>{users.filter((u) => u.is_seller).length}</p>
        </div>
        <div className="card" style={{ padding: 16, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Admins</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: "var(--sand)" }}>{users.filter((u) => u.is_admin).length}</p>
        </div>
        <div className="card" style={{ padding: 16, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Banned</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: "#f87171" }}>{users.filter((u) => u.is_banned).length}</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          className="input"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 34 }}
        />
      </div>

      {/* User list */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>User</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Email</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Role</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Joined</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid var(--border)", opacity: u.is_banned ? 0.5 : 1 }}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(110,172,218,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <User size={12} color="var(--text-muted)" />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: "var(--text, white)" }}>{u.display_name || u.username}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--text-muted)" }}>{u.email || "—"}</td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
                      {u.is_admin && <span className="badge badge-sand" style={{ fontSize: 9 }}><Shield size={9} /> Admin</span>}
                      {u.is_seller && <span className="badge badge-sky" style={{ fontSize: 9 }}><Store size={9} /> Seller</span>}
                      {u.is_banned && <span className="badge" style={{ fontSize: 9, background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}><Ban size={9} /> Banned</span>}
                      {!u.is_admin && !u.is_seller && !u.is_banned && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Buyer</span>}
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center", color: "var(--text-muted)", fontSize: 11 }}>
                    {timeAgo(u.created_at)}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    {!u.is_admin && (
                      <button
                        type="button"
                        className={u.is_banned ? "btn-ghost" : "btn-ghost danger"}
                        style={{ fontSize: 11, padding: "4px 10px" }}
                        onClick={() => handleToggleBan(u.id, u.is_banned)}
                      >
                        {u.is_banned ? <><CheckCircle size={11} /> Unban</> : <><Ban size={11} /> Ban</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No users found</p>
        )}
      </div>
    </div>
  );
}
