"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Shield, Zap, Globe, Lock, ArrowRight } from "lucide-react";

const FEATURES = [
  { icon: Shield, title: "Trustless Trading", desc: "Smart contracts escrow every transaction — no middlemen, no hidden fees." },
  { icon: Zap, title: "Instant Settlement", desc: "Pay with USDC and receive ownership proof on-chain within seconds." },
  { icon: Globe, title: "Global Access", desc: "Buy and sell from anywhere. Borderless peer-to-peer commerce." },
  { icon: Lock, title: "You Own Your Data", desc: "Encrypted profiles and wallet-only authentication. Your keys, your goods." },
];

const STEPS = [
  { n: "01", title: "Connect Wallet", desc: "Link your wallet or create a Firee account to pay in USDC." },
  { n: "02", title: "Browse & Buy", desc: "Explore verified products and redeem with USDC." },
  { n: "03", title: "Track Orders", desc: "Follow delivery status from Redeemed to Completed." },
  { n: "04", title: "Resell & Earn", desc: "List items back on Firee and earn resale royalties." },
];

const FAQ = [
  {
    q: "What is Firee?",
    a: "Firee is a decentralized digital marketplace where creators sell products directly to buyers using USDC stablecoin. All payments are secured by smart contracts on the Base blockchain — no middlemen, no chargebacks.",
  },
  {
    q: "How do I pay for products?",
    a: "All products are priced in USDC (a stablecoin pegged to the US dollar). Connect your wallet (MetaMask, Coinbase Wallet, etc.), approve the USDC amount, and the smart contract handles the rest.",
  },
  {
    q: "What blockchain does Firee use?",
    a: "Firee runs on the Base network (built on Ethereum L2). This means fast transactions, low fees, and full Ethereum security. We currently operate on Base Sepolia testnet during beta.",
  },
  {
    q: "Is my payment safe?",
    a: "Yes. Every payment goes through an on-chain escrow smart contract. Funds are held securely until the transaction is complete. The contract is verified and transparent on the blockchain.",
  },
  {
    q: "How do sellers receive their money?",
    a: "After a purchase, the seller's earnings (minus a 3% platform fee) are held in the escrow contract. Sellers can withdraw their USDC balance to their wallet at any time from the Seller Dashboard.",
  },
  {
    q: "What can I sell on Firee?",
    a: "Digital products like templates, design assets, e-books, courses, software, presets, and more. Upload your file, set a USDC price, and publish. Buyers get instant access after payment.",
  },
  {
    q: "Do I need a crypto wallet?",
    a: "You can create an account with email to browse products. To make purchases or sell products, you'll need a wallet like MetaMask or Coinbase Wallet connected to the Base network.",
  },
  {
    q: "What fees does Firee charge?",
    a: "Firee charges a flat 3% platform fee on each sale. There are no listing fees, no monthly subscriptions, and no hidden costs. Blockchain gas fees are minimal on Base.",
  },
];

export default function Home() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const stats = [
    { value: "12,400+", label: "Products" },
    { value: "3,800+", label: "Active Users" },
    { value: "892K USDC", label: "Volume" },
  ];

  return (
    <div className="page-shell">
      <Navbar variant="landing" />

      <section className="grid-bg" style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", minHeight: "calc(100vh - 60px)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(3,52,110,0.6) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, var(--sky), rgba(226,226,182,0.6) 50%, var(--sky), transparent)", opacity: 0.5 }} />

        <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "48px 24px", maxWidth: 720 }}>
          <div className="badge badge-sky fade-up d1" style={{ marginBottom: 28, display: "inline-flex" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--sky)", animation: "pulse-slow 2s infinite" }} />
            Decentralized Marketplace
          </div>

          <h1 className="fade-up d2" style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(32px, 6vw, 68px)", lineHeight: 1.05, letterSpacing: "-0.03em", color: "var(--text, white)", marginBottom: 20 }}>
            The Era of <span style={{ color: "var(--sand)" }}>Decentralized</span> Marketplace
          </h1>

          <p className="fade-up d3" style={{ fontSize: 16, lineHeight: 1.7, color: "var(--text-muted)", maxWidth: 500, margin: "0 auto 36px" }}>
            Trade freely. Own truly. A peer-to-peer marketplace built on transparency, trust, and blockchain technology.
          </p>

          <div className="fade-up d4" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/login" className="btn-sand">Start Journey <ArrowRight size={14} /></Link>
            <Link href="/create" className="btn-ghost">Create</Link>
          </div>

          <div className="fade-up d5" style={{ marginTop: 56, display: "flex", justifyContent: "center", gap: "clamp(24px, 6vw, 56px)", flexWrap: "wrap" }}>
            {stats.map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div className="mono" style={{ fontSize: "clamp(18px, 3vw, 24px)", fontWeight: 700, color: "var(--sand)" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "rgba(110,172,218,0.5)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <div className="container">
          <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(110,172,218,0.5)", marginBottom: 8 }}>Why Firee</p>
          <h2 className="section-title">Built for the new economy</h2>
          <p className="section-sub">Everything you need to buy, sell, and own digital & physical goods — decentralized.</p>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="card feature-card">
                <div className="feature-icon"><f.icon size={20} /></div>
                <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, color: "var(--text, white)" }}>{f.title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--text-muted)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="section" style={{ background: "rgba(3,52,110,0.08)" }}>
        <div className="container">
          <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(110,172,218,0.5)", marginBottom: 8 }}>How it works</p>
          <h2 className="section-title">Four steps to freedom</h2>
          <div className="steps-grid">
            {STEPS.map((s) => (
              <div key={s.n} className="card" style={{ padding: 24 }}>
                <p className="step-num">{s.n}</p>
                <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, color: "var(--text, white)" }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section">
        <div className="container" style={{ maxWidth: 680 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(110,172,218,0.5)", marginBottom: 8 }}>FAQ</p>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-sub">Everything you need to know about Firee.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FAQ.map((item, i) => (
              <div key={item.q} className="card" style={{ padding: 0, overflow: "hidden" }}>
                <button
                  type="button"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  style={{
                    width: "100%", padding: "16px 18px", background: "none", border: "none",
                    cursor: "pointer", textAlign: "left", fontFamily: "inherit", fontSize: 14,
                    fontWeight: 600, color: "var(--text, white)", display: "flex",
                    justifyContent: "space-between", alignItems: "center", gap: 16,
                  }}
                >
                  {item.q}
                  <span style={{ color: "var(--sky)", fontSize: 18, flexShrink: 0 }}>{faqOpen === i ? "−" : "+"}</span>
                </button>
                {faqOpen === i && (
                  <p style={{ padding: "0 18px 16px", fontSize: 13, lineHeight: 1.7, color: "var(--text-muted)" }}>
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-box">
            <h2 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(22px, 4vw, 32px)", color: "var(--text, white)", marginBottom: 12 }}>Ready to trade on your terms?</h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 28, maxWidth: 440, margin: "0 auto 28px" }}>Join thousands of users buying and selling on the first truly decentralized marketplace.</p>
            <Link href="/login" className="btn-sand">Explore Marketplace <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
