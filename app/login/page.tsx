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
                <Link href="/support" style={{ fontSize: 11, color: "var(--text-muted)", textDecoration: "none" }}>Forgot password?</Link>
              </div>
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
      <Footer />
    </div>
  );
}
