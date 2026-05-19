"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useApp } from "../../context/AppContext";
import { HelpCircle, Mail, MessageSquare, Send } from "lucide-react";

const FAQ = [
  { q: "I paid but didn't receive my download — what do I do?", a: "Check your Orders page — if the transaction is confirmed on-chain, the Download button should appear. If not, verify the transaction on BaseScan using your tx hash. If the issue persists, contact us with your transaction hash and we'll help." },
  { q: "My wallet won't connect — how do I fix this?", a: "Make sure you're using a supported wallet (MetaMask, Coinbase Wallet, etc.) and that you're connected to the Base Sepolia network. Try refreshing the page or disconnecting and reconnecting your wallet." },
  { q: "Can I get a refund?", a: "Since payments are processed through a smart contract on the blockchain, they cannot be reversed. Please make sure you're purchasing the right product before confirming the transaction." },
  { q: "My product upload failed — what should I do?", a: "Check your file size (max 50MB) and make sure you're logged in. If the upload keeps failing, try a different browser or clear your cache. Contact us if the problem continues." },
  { q: "How do I reset my password?", a: "Go to the Login page and click \"Forgot password?\". We'll send a reset link to your registered email address." },
  { q: "How do I report a problem with a product?", a: "Use the contact form on this page or email us at hello@firee.app. Include the product link and describe the issue — we'll investigate and respond within 24 hours." },
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
