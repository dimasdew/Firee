"use client";

import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { updateProfile } from "../../lib/supabase/auth";
import { Pencil, Check, Camera, Image, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, setUser, showToast } = useApp();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username ?? "");
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [language, setLanguage] = useState("English");
  const [notif, setNotif] = useState("All");
  const [saving, setSaving] = useState(false);

  // Sync local state when user loads/changes
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setDisplayName(user.displayName || user.username);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, {
        username: username.trim(),
        display_name: displayName.trim(),
      });
      // Update context so UI reflects immediately
      setUser((prev) => prev ? { ...prev, username: username.trim(), displayName: displayName.trim() } : prev);
      setEditing(false);
      showToast("Profile updated!");
    } catch (err: any) {
      if (err?.message?.includes("duplicate") || err?.message?.includes("unique")) {
        showToast("Username already taken");
      } else {
        showToast("Failed to save profile");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Personal Information */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)", marginBottom: 4 }}>Personal Information</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Manage your display name and username</p>
          </div>
          <button
            type="button"
            className={editing ? "btn-primary" : "btn-ghost"}
            onClick={editing ? handleSaveProfile : () => setEditing(true)}
            disabled={saving}
            style={{ flexShrink: 0, padding: "8px 16px", fontSize: 12 }}
          >
            {saving
              ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Saving...</>
              : editing ? <><Check size={13} /> Save</> : <><Pencil size={13} /> Edit</>
            }
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <div>
            <label className="label">Display Name</label>
            <input className="input" value={displayName} disabled={!editing} onChange={(e) => setDisplayName(e.target.value)} style={{ opacity: editing ? 1 : 0.6 }} />
          </div>
          <div>
            <label className="label">Username</label>
            <input className="input" value={username} disabled={!editing} onChange={(e) => setUsername(e.target.value)} style={{ opacity: editing ? 1 : 0.6 }} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Email</label>
            <input className="input" value={user?.email ?? "guest@firee.app"} disabled style={{ opacity: 0.6 }} />
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Email cannot be changed</p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)", marginBottom: 4 }}>Appearance</h3>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Customize your profile look</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="label">Avatar</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(110,172,218,0.08)", border: "1px dashed rgba(110,172,218,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Camera size={16} color="rgba(110,172,218,0.5)" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Upload profile picture</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, opacity: 0.6 }}>PNG, JPG up to 2MB</p>
              </div>
              <button type="button" className="btn-ghost" style={{ fontSize: 11, padding: "6px 12px" }}>Upload</button>
            </div>
          </div>
          <div>
            <label className="label">Banner</label>
            <div style={{ height: 72, borderRadius: 8, background: "rgba(110,172,218,0.05)", border: "1px dashed rgba(110,172,218,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 8 }}>
              <Image size={14} color="rgba(110,172,218,0.3)" />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Upload banner image</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)", marginBottom: 4 }}>Preferences</h3>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Language and notification settings</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <div>
            <label className="label">Language</label>
            <select className="input" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {["English", "Japanese", "Korean", "Chinese"].map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Notifications</label>
            <select className="input" value={notif} onChange={(e) => setNotif(e.target.value)}>
              {["All", "Important only", "None"].map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
          <button type="button" className="btn-primary" onClick={() => showToast("Preferences saved!")} style={{ padding: "10px 24px" }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
