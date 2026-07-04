"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useApp } from "../../context/AppContext";
import GoogleSignInButton from "../../components/GoogleSignInButton";
import { validatePassword } from "../../lib/utils";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Check, X } from "lucide-react";

export default function CreatePage() {
  const router = useRouter();
  const { register } = useApp();
  const [show, setShow] = useState({ pwd: false, re: false });
  const [form, setForm] = useState({ email: "", password: "", retype: "" });
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const pwdChecks = {
    length: form.password.length >= 6,
    lower: /[a-z]/.test(form.password),
    upper: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password),
  };

  const submit = async () => {
    if (!form.email.includes("@")) { setError("Enter a valid email."); return; }
    if (form.password !== form.retype) { setError("Passwords don't match."); return; }
    const v = validatePassword(form.password);
    if (!v.valid) { setError(v.message); return; }
    const ok = await register(form.email, form.password);
    if (ok) setEmailSent(true);
    else setError("Registration failed.");
  };

  return (
    <div className="page-shell">
      <Navbar variant="landing" />
      <div className="grid-bg auth-page">
        <div className="auth-inner">
          <div className="badge badge-sky fade-up">New Account</div>
          <h1 className="fade-up d1 auth-title">Create account</h1>
          <p className="fade-up d2 auth-sub">Join the decentralized marketplace</p>
          <div className="card fade-up d2 auth-card">
            {emailSent ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(110,172,218,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Mail size={24} color="var(--sky)" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text, white)", marginBottom: 8 }}>Check your email</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
                  We sent a confirmation link to <strong style={{ color: "var(--sky)" }}>{form.email}</strong>.<br />
                  Click the link to activate your account.
                </p>
                <button type="button" className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => router.push("/login")}>
                  Go to Login <ArrowRight size={14} />
                </button>
              </div>
            ) : (
            <>
            {error && <p style={{ fontSize: 12, color: "#f87171", marginBottom: 12 }}>{error}</p>}
            <GoogleSignInButton mode="signup" />
            <div className="auth-divider">
              <div className="divider" style={{ flex: 1 }} />
              <span>or register with email</span>
              <div className="divider" style={{ flex: 1 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="label">Email</label>
              <div className="input-icon-wrap">
                <Mail size={14} className="input-icon" />
                <input className="input" type="email" placeholder="you@example.com" style={{ paddingLeft: 36 }} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            {[
              { key: "password" as const, label: "Password", showKey: "pwd" as const },
              { key: "retype" as const, label: "Re-type Password", showKey: "re" as const },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label className="label">{f.label}</label>
                <div className="input-icon-wrap">
                  <Lock size={14} className="input-icon" />
                  <input className="input" type={show[f.showKey] ? "text" : "password"} placeholder="••••••••" style={{ paddingLeft: 36, paddingRight: 36 }} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                  <button type="button" className="input-eye" onClick={() => setShow({ ...show, [f.showKey]: !show[f.showKey] })}>{show[f.showKey] ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                </div>
              </div>
            ))}
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Password requirements</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "4px 12px" }}>
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
            <button type="button" className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 4 }} onClick={submit}>Create Account <ArrowRight size={14} /></button>
            </>
            )}
          </div>
          <p className="auth-footer">Already have an account? <Link href="/login">Login</Link></p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
