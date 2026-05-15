"use client";

import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Pencil, Check } from "lucide-react";

export default function ProfilePage() {
  const { user, showToast } = useApp();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username ?? "dimasdew");
  const [language, setLanguage] = useState("English");
  const [notif, setNotif] = useState("Yes");
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    showToast("Settings saved!");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="card" style={{ padding: 28 }}>
      <div className="badge badge-sky" style={{ marginBottom: 20, fontSize: 9 }}>Account Settings</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 480 }}>
        <div>
          <label className="label">Username</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input className="input" value={username} disabled={!editing} onChange={(e) => setUsername(e.target.value)} style={{ flex: 1, opacity: editing ? 1 : 0.6 }} />
            <button type="button" className={editing ? "btn-primary" : "btn-ghost"} onClick={() => setEditing(!editing)} style={{ flexShrink: 0, padding: "0 16px" }}>
              {editing ? <><Check size={13} /> Done</> : <><Pencil size={13} /> Edit</>}
            </button>
          </div>
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" value={user?.email ?? "guest@firee.app"} disabled style={{ opacity: 0.6 }} />
        </div>
        <div>
          <label className="label">Avatar</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(110,172,218,0.08)", border: "1px dashed rgba(110,172,218,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Pencil size={14} color="rgba(110,172,218,0.4)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Click to upload avatar</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, opacity: 0.7 }}>PNG, JPG up to 2MB</p>
            </div>
            <button type="button" className="btn-ghost" style={{ fontSize: 11, padding: "6px 12px", color: "#f87171", borderColor: "rgba(248,113,113,0.2)" }}>Remove</button>
          </div>
        </div>
        <div>
          <label className="label">Banner</label>
          <div style={{ height: 72, borderRadius: 8, background: "rgba(110,172,218,0.05)", border: "1px dashed rgba(110,172,218,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 8 }}>
            <Pencil size={14} color="rgba(110,172,218,0.3)" />
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Upload banner image</span>
          </div>
        </div>
        <div>
          <label className="label">Language</label>
          <select className="input" value={language} onChange={(e) => setLanguage(e.target.value)}>
            {["Indonesia", "English", "Japanese", "Korean"].map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label className="label">Notifications</label>
            <select className="input" value={notif} onChange={(e) => setNotif(e.target.value)} style={{ width: "100%" }}>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
          <button type="button" className={saved ? "btn-ghost" : "btn-primary"} onClick={save} style={{ flexShrink: 0 }}>
            {saved ? <><Check size={13} /> Saved</> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
