"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useApp } from "../../context/AppContext";
import GoogleSignInButton from "../../components/GoogleSignInButton";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

export default function CreatePage() {
  const router = useRouter();
  const { register } = useApp();
  const [show, setShow] = useState({ pwd: false, re: false });
  const [form, setForm] = useState({ email: "", password: "", retype: "" });
  const [error, setError] = useState("");

  const submit = () => {
    if (!form.email.includes("@")) { setError("Enter a valid email."); return; }
    if (form.password !== form.retype) { setError("Passwords don't match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (register(form.email, form.password)) router.push("/dashboard");
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
            {error && <p style={{ fontSize: 12, color: "#f87171", marginBottom: 12 }}>{error}</p>}
            <GoogleSignInButton mode="signup" />
            <div className="auth-divider">
              <div className="divider" style={{ flex: 1 }} />
              <span>or sign up with email</span>
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
            <button type="button" className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 4 }} onClick={submit}>Create Account <ArrowRight size={14} /></button>
          </div>
          <p className="auth-footer">Already have an account? <Link href="/login">Sign in</Link></p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
