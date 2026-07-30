"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Shield, Zap, Globe, Lock, ArrowRight } from "lucide-react";

const FEATURES = [
  { icon: Shield, title: "Escrow Protection", desc: "Your payment sits in a smart contract until you confirm delivery. The seller only gets paid when your item arrives. 3% flat fee." },
  { icon: Zap, title: "Automatic Refunds", desc: "Seller never ships? The contract refunds you automatically after 14 days. No support tickets, no waiting on a human." },
  { icon: Globe, title: "Global Access", desc: "Buy and sell physical goods from anywhere. No bank account needed, just a wallet with USDC." },
  { icon: Lock, title: "On-Chain Transparency", desc: "Every order, shipment, and payout is verifiable on the Base blockchain. No hidden holds on seller funds." },
];

const STEPS = [
  { n: "01", title: "Create Account", desc: "Sign up with email or Google. Connect your wallet to buy or sell." },
  { n: "02", title: "Browse & Buy", desc: "Find physical products, enter your shipping address, and pay with USDC on Base. Funds go into escrow, not to the seller." },
  { n: "03", title: "Track & Receive", desc: "The seller ships with a tracking number. When your item arrives, confirm delivery to release the payment." },
  { n: "04", title: "Sell & Earn", desc: "List your own products and earn USDC with every sale. Payment is guaranteed by the escrow contract. Only 3% fee." },
];

const BUYER_FAQ = [
  {
    q: "How do I buy a product?",
    a: "Browse the marketplace, click a product, enter your shipping address, then pay with USDC. Your payment is held in a smart contract escrow until the item arrives and you confirm delivery.",
  },
  {
    q: "What is USDC and how do I get it?",
    a: "USDC is a stablecoin pegged 1:1 to the US dollar. You can buy USDC on exchanges like Coinbase or Binance, then send it to your wallet on the Base network.",
  },
  {
    q: "Is my payment safe?",
    a: "Yes. Your USDC is locked in an on-chain escrow contract, not sent to the seller. The seller only gets paid when you confirm delivery. If they never ship, you can claim a full refund after 14 days.",
  },
  {
    q: "Do I need a crypto wallet?",
    a: "You can create an account with email to browse products. To make purchases, you'll need a wallet like MetaMask or Coinbase Wallet connected to the Base network.",
  },
  {
    q: "What happens after I pay?",
    a: "The seller ships your item and posts a tracking number, which you can follow from your Orders page. When it arrives, hit Confirm Delivery to release the payment. If something is wrong, open a dispute instead.",
  },
  {
    q: "What if my item never arrives?",
    a: "If the seller does not mark the order as shipped within 14 days, you can claim an automatic full refund straight from the contract. If it shipped but arrived damaged or wrong, open a dispute and our team will review it.",
  },
];

const SELLER_FAQ = [
  {
    q: "How do I start selling?",
    a: "Create an account, go to the Seller Dashboard, and click \"New Product\". Add photos, a description, set a USDC price and where you ship from, then publish.",
  },
  {
    q: "What can I sell on Firee?",
    a: "Physical goods of any kind: electronics, apparel, collectibles, handmade items, and more. You handle the shipping; the escrow contract handles the payment.",
  },
  {
    q: "How do I receive my earnings?",
    a: "When a buyer pays, the USDC is locked in escrow. Ship the item and post the tracking number. Once the buyer confirms delivery (or the 30-day auto-release passes), your earnings minus the 3% fee become withdrawable from the Seller Dashboard.",
  },
  {
    q: "What fees does Firee charge?",
    a: "Firee charges a flat 3% platform fee on each sale. There are no listing fees, no monthly subscriptions, and no hidden costs. Blockchain gas fees on Base are minimal.",
  },
  {
    q: "What blockchain does Firee use?",
    a: "Firee runs on the Base network (Ethereum L2) — fast transactions, low fees, and full Ethereum security. We currently operate on Base Sepolia testnet during beta.",
  },
];

export default function Home() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [faqTab, setFaqTab] = useState<"buyer" | "seller">("buyer");

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
            Buy Real Things with <span style={{ color: "var(--sand)" }}>Crypto, Safely</span>
          </h1>

          <p className="fade-up d3" style={{ fontSize: 16, lineHeight: 1.7, color: "var(--text-muted)", maxWidth: 500, margin: "0 auto 36px" }}>
            A peer-to-peer marketplace for physical goods. Pay with USDC on Base, and your money stays in escrow until your item actually arrives.
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
          <h2 className="section-title">Trust the contract, not the stranger</h2>
          <p className="section-sub">Everything you need to buy and sell physical goods peer to peer, with payment protection built into the chain.</p>
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

          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <button
              type="button"
              className={`cat-btn ${faqTab === "buyer" ? "active" : ""}`}
              onClick={() => { setFaqTab("buyer"); setFaqOpen(null); }}
            >
              For Buyers
            </button>
            <button
              type="button"
              className={`cat-btn ${faqTab === "seller" ? "active" : ""}`}
              onClick={() => { setFaqTab("seller"); setFaqOpen(null); }}
            >
              For Sellers
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(faqTab === "buyer" ? BUYER_FAQ : SELLER_FAQ).map((item, i) => (
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
            <h2 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(22px, 4vw, 32px)", color: "var(--text, white)", marginBottom: 12 }}>Shop without trusting a stranger</h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 28, maxWidth: 440, margin: "0 auto 28px" }}>Join buyers and sellers trading physical goods with escrow-protected USDC payments on Firee.</p>
            <Link href="/login" className="btn-sand">Explore Marketplace <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
