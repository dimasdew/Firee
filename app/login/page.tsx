"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useApp } from "../../context/AppContext";
import GoogleSignInButton from "../../components/GoogleSignInButton";
import FireeConnectButton from "../../components/FireeConnectButton";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  // M2: forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const submit = async () => {
    if (!form.email.includes("@")) { setError("Enter a valid email."); return; }
    if (form.password.length < 4) { setError("Password too short."); return; }
    setError("");
    setLoading(true);
    try {
      const ok = await login(form.email, form.password);
      if (ok) router.push("/dashboard");
      else setError("Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const submitForgot = async () => {
    if (!forgotEmail.includes("@")) return;
    setForgotLoading(true);
    try {
      await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      setForgotSent(true);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar variant="landing" />
      <div className="grid-bg auth-page">
        <div className="auth-inner">
          <div className="badge badge-sky fade-up">Auth</div>
          <h1 className="fade-up d1 auth-title">Welcome back</h1>
          <p className="fade-up d2 auth-sub">Login to your Firee account</p>
          <div className="card fade-up d2 auth-card">
            {error && <p style={{ fontSize: 12, color: "#f87171", marginBottom: 12 }}>{error}</p>}

            <GoogleSignInButton mode="signin" />

            <div className="auth-divider">
              <div className="divider" style={{ flex: 1 }} />
              <span>or login with email</span>
              <div className="divider" style={{ flex: 1 }} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label className="label">Email</label>
              <div className="input-icon-wrap">
                <Mail size={14} className="input-icon" />
                <input className="input" type="email" placeholder="you@example.com" style={{ paddingLeft: 36 }} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label className="label" style={{ marginBottom: 0 }}>Password</label>
                <button
                    type="button"
                    onClick={() => { setShowForgot(true); setForgotSent(false); setForgotEmail(""); }}
                    style={{ fontSize: 11, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    Forgot password?
                  </button>              </div>
              <div className="input-icon-wrap">
                <Lock size={14} className="input-icon" />
                <input className="input" type={showPwd ? "text" : "password"} placeholder="••••••••" style={{ paddingLeft: 36, paddingRight: 36 }} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} onKeyDown={(e) => e.key === "Enter" && submit()} />
                <button type="button" className="input-eye" onClick={() => setShowPwd(!showPwd)}>{showPwd ? <EyeOff size={14} /> : <Eye size={14} />}</button>
              </div>
            </div>
            <button type="button" className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 4 }} onClick={submit} disabled={loading}>
              {loading ? "Logging in..." : <>Login <ArrowRight size={14} /></>}
            </button>

            <div className="auth-divider">
              <div className="divider" style={{ flex: 1 }} />
              <span>or</span>
              <div className="divider" style={{ flex: 1 }} />
            </div>
            <FireeConnectButton fullWidth onConnected={() => router.push("/dashboard")} />
          </div>
          <p className="auth-footer">No account? <Link href="/create">Create one</Link></p>
        </div>
      </div>

      {/* M2: Forgot password modal */}
      {showForgot && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
        }} onClick={() => setShowForgot(false)}>
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ padding: 28, width: "min(380px, 90vw)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text, white)", marginBottom: 8 }}>
              Reset Password
            </h3>
            {forgotSent ? (
              <p style={{ fontSize: 13, color: "#4ade80" }}>
                If that email is registered, a reset link has been sent. Check your inbox.
              </p>
            ) : (
              <>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
                  Enter your email and we'll send a reset link.
                </p>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitForgot()}
                  style={{ marginBottom: 12 }}
                />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={submitForgot}
                  disabled={forgotLoading || !forgotEmail.includes("@")}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {forgotLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
