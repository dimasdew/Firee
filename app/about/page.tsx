import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Flame, Users, Shield, TrendingUp } from "lucide-react";

export const metadata: Metadata = { title: "About" };

const STATS = [
  { icon: Users, label: "Active traders", value: "3,800+" },
  { icon: TrendingUp, label: "USDC volume", value: "892K+" },
  { icon: Shield, label: "Verified listings", value: "12,400+" },
];

export default function AboutPage() {
  return (
    <div className="page-shell">
      <Navbar variant="landing" />
      <main className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="badge badge-sky" style={{ marginBottom: 16, display: "inline-flex" }}>
            <Flame size={12} /> About Firee
          </div>
          <h1 className="section-title">Redefining commerce on-chain</h1>
          <p className="section-sub">
            Firee is a decentralized marketplace where buyers and sellers connect directly through smart contracts.
            No intermediaries. Transparent pricing in USDC. Full ownership of your data and transactions.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--text-muted)", marginBottom: 40 }}>
            Built by dimasdew as a portfolio showcase of modern Web3 UX — combining Next.js, responsive design,
            and intuitive flows for browsing, redeeming, and tracking orders on a simulated blockchain layer.
          </p>
          <div className="features-grid" style={{ marginBottom: 48 }}>
            {STATS.map((s) => (
              <div key={s.label} className="card" style={{ padding: 20, textAlign: "center" }}>
                <s.icon size={22} color="var(--sky)" style={{ margin: "0 auto 12px" }} />
                <p className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--sand)", marginBottom: 4 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>
          <Link href="/dashboard" className="btn-sand">Explore Marketplace</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
