import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Firee",
  description: "How Firee collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="page-shell" style={{ alignItems: "center" }}>
      <main className="container" style={{ maxWidth: 720, padding: "48px 16px 80px" }}>
        <Link href="/" style={{ fontSize: 12, color: "var(--sky)", textDecoration: "none", marginBottom: 24, display: "inline-block" }}>
          ← Back to Home
        </Link>
        <h1 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 28, color: "var(--text, white)", marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 32 }}>Last updated: May 2025</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, fontSize: 14, lineHeight: 1.8, color: "var(--text-muted)" }}>
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text, white)", marginBottom: 8 }}>1. Information We Collect</h2>
            <p><strong>Account data:</strong> Email address, username, display name, and avatar when you register via email or Google OAuth.</p>
            <p><strong>Wallet data:</strong> Public wallet address when you connect via WalletConnect/RainbowKit. We never access or store your private keys.</p>
            <p><strong>Transaction data:</strong> Purchase history, order details, and on-chain transaction hashes.</p>
            <p><strong>Usage data:</strong> Pages visited, search queries, and interactions with the Platform for analytics purposes.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text, white)", marginBottom: 8 }}>2. How We Use Your Data</h2>
            <p>We use your information to: provide and improve the Platform, process transactions, send purchase confirmations and sale notifications, prevent fraud, and comply with legal obligations.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text, white)", marginBottom: 8 }}>3. Data Storage & Security</h2>
            <p>Your data is stored securely on Supabase (hosted on AWS). We implement Row Level Security (RLS) policies, encrypted connections (TLS), and access controls to protect your information. Passwords are hashed and never stored in plain text.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text, white)", marginBottom: 8 }}>4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li><strong>Supabase</strong> — Authentication and database</li>
              <li><strong>Vercel</strong> — Hosting and deployment</li>
              <li><strong>Resend</strong> — Transactional email delivery</li>
              <li><strong>WalletConnect / RainbowKit</strong> — Wallet connection</li>
              <li><strong>Base (Coinbase L2)</strong> — Blockchain transactions</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text, white)", marginBottom: 8 }}>5. Blockchain Data</h2>
            <p>Transactions on the Base blockchain are public and immutable. Wallet addresses and transaction hashes are visible on block explorers. This is inherent to blockchain technology and outside our control.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text, white)", marginBottom: 8 }}>6. Cookies</h2>
            <p>We use essential cookies for authentication session management. We do not use tracking cookies or third-party advertising cookies.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text, white)", marginBottom: 8 }}>7. Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data by contacting us. You may also delete your account at any time. Note that blockchain transactions cannot be deleted or modified.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text, white)", marginBottom: 8 }}>8. Data Retention</h2>
            <p>We retain your account data for as long as your account is active. Order history is retained for record-keeping and dispute resolution purposes. You may request data deletion by contacting support.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text, white)", marginBottom: 8 }}>9. Changes</h2>
            <p>We may update this Privacy Policy periodically. We will notify you of significant changes via email or Platform notification.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text, white)", marginBottom: 8 }}>10. Contact</h2>
            <p>For privacy-related questions, contact us at <a href="mailto:support@firee.app" style={{ color: "var(--sky)" }}>support@firee.app</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
