"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useApp } from "../../context/AppContext";
import { validatePassword } from "../../lib/utils";
import { Eye, EyeOff, Lock, ArrowRight, Check, X } from "lucide-react";

export default function SetPasswordPage() {
  const router = useRouter();
  const { setUserPassword, user } = useApp();
  const [show, setShow] = useState({ pwd: false, re: false });
  const [form, setForm] = useState({ password: "", retype: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const pwdChecks = {
    length: form.password.length >= 6,
    lower: /[a-z]/.test(form.password),
    upper: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password),
  };

  const submit = async () => {
    if (form.password !== form.retype) { setError("Passwords don't match."); return; }
    const v = validatePassword(form.password);
    if (!v.valid) { setError(v.message); return; }
    setLoading(true);
    setError("");
    const ok = await setUserPassword(form.password);
    setLoading(false);
    if (ok) router.push("/dashboard");
    else setError("Failed to set password.");
  };

  return (
    <div className="page-shell">
      <Navbar variant="landing" />
      <div className="grid-bg auth-page">
        <div className="auth-inner">
          <div className="badge badge-sky fade-up">Security</div>
          <h1 className="fade-up d1 auth-title">Set your password</h1>
          <p className="fade-up d2 auth-sub">
            {user?.authProvider === "google"
              ? "You signed in with Google. Please set a password to secure your account."
              : "Create a secure password for your Firee account."}
          </p>
          <div className="card fade-up d2 auth-card">
            {error && <p style={{ fontSize: 12, color: "#f87171", marginBottom: 12 }}>{error}</p>}

            {[
              { key: "password" as const, label: "New Password", showKey: "pwd" as const },
              { key: "retype" as const, label: "Re-type Password", showKey: "re" as const },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label className="label">{f.label}</label>
                <div className="input-icon-wrap">
                  <Lock size={14} className="input-icon" />
                  <input
                    className="input"
                    type={show[f.showKey] ? "text" : "password"}
                    placeholder="••••••••"
                    style={{ paddingLeft: 36, paddingRight: 36 }}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                  <button type="button" className="input-eye" onClick={() => setShow({ ...show, [f.showKey]: !show[f.showKey] })}>
                    {show[f.showKey] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            ))}

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Password requirements</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
                {[
                  { label: "At least 6 characters", pass: pwdChecks.length },
                  { label: "One lowercase letter", pass: pwdChecks.lower },
                  { label: "One uppercase letter", pass: pwdChecks.upper },
                  { label: "One number", pass: pwdChecks.number },
                  { label: "One special character", pass: pwdChecks.special },
                ].map((c) => (
                  <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: c.pass ? "var(--sky)" : "rgba(110,172,218,0.4)" }}>
                    {c.pass ? <Check size={10} /> : <X size={10} />}
                    {c.label}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
              onClick={submit}
              disabled={loading}
            >
              {loading ? "Setting password..." : "Set Password"} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
