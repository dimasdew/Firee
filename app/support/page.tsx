"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useApp } from "../../context/AppContext";
import { HelpCircle, Mail, MessageSquare, Send } from "lucide-react";

const FAQ = [
  { q: "How do I pay on Firee?", a: "All products are priced in USDC. Connect your wallet or use a Firee account to redeem items." },
  { q: "What does Redeemed mean?", a: "Your order is confirmed on-chain. Status moves to Delivering, then Completed." },
  { q: "Can I resell items?", a: "Yes — tokenized goods support resale with automatic royalty distribution to creators." },
  { q: "Is my data safe?", a: "Profiles are encrypted. Wallet keys never leave your device when using Connect Wallet." },
];

export default function SupportPage() {
  const { showToast } = useApp();
  const [open, setOpen] = useState<number | null>(0);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Message sent! We'll reply within 24 hours.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="page-shell">
      <Navbar variant="landing" />
      <main className="section">
        <div className="container">
          <div className="badge badge-sky" style={{ marginBottom: 16, display: "inline-flex" }}>
            <HelpCircle size={12} /> Support
          </div>
          <h1 className="section-title">How can we help?</h1>
          <p className="section-sub">Find answers or reach our team directly.</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--text, white)" }}>FAQ</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {FAQ.map((item, i) => (
                  <div key={item.q} className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <button type="button" onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: "var(--text, white)", display: "flex", justifyContent: "space-between" }}>
                      {item.q}
                      <span style={{ color: "var(--sky)" }}>{open === i ? "−" : "+"}</span>
                    </button>
                    {open === i && <p style={{ padding: "0 16px 14px", fontSize: 13, lineHeight: 1.65, color: "var(--text-muted)" }}>{item.a}</p>}
                  </div>
                ))}
              </div>
            </div>

            <form className="card auth-card" onSubmit={submit}>
              <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, color: "var(--text, white)" }}>
                <MessageSquare size={16} color="var(--sky)" /> Contact us
              </h2>
              {["name", "email", "message"].map((field) => (
                <div key={field} style={{ marginBottom: 14 }}>
                  <label className="label">{field === "message" ? "Message" : field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  {field === "message" ? (
                    <textarea className="input" rows={4} placeholder="Describe your issue..." required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} style={{ resize: "vertical" }} />
                  ) : (
                    <input className="input" type={field === "email" ? "email" : "text"} required placeholder={field === "email" ? "you@example.com" : "Your name"} value={form[field as "name" | "email"]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
                  )}
                </div>
              ))}
              <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                <Send size={14} /> Send Message
              </button>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <Mail size={12} /> hello@firee.app
              </p>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
