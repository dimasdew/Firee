import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Firee",
  description: "Terms and conditions for using the Firee marketplace.",
};

export default function TermsPage() {
  return (
    <div className="page-shell" style={{ alignItems: "center" }}>
      <main className="container" style={{ maxWidth: 720, padding: "48px 16px 80px" }}>
        <Link href="/" style={{ fontSize: 12, color: "var(--sky)", textDecoration: "none", marginBottom: 24, display: "inline-block" }}>
          ← Back to Home
        </Link>
        <h1 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 28, color: "var(--text, white)", marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 32 }}>Last updated: May 2025</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, fontSize: 14, lineHeight: 1.8, color: "var(--text-muted)" }}>
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text, white)", marginBottom: 8 }}>1. Acceptance of Terms</h2>
            <p>By accessing or using Firee (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text, white)", marginBottom: 8 }}>2. Platform Overview</h2>
            <p>Firee is a decentralized digital marketplace that enables users to buy and sell digital products (smart contracts, DApp templates, UI kits, developer tools) using USDC on the Base blockchain. Firee acts as an intermediary platform and does not own, create, or guarantee any listed products.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text, white)", marginBottom: 8 }}>3. Eligibility</h2>
            <p>You must be at least 18 years old and legally capable of entering into binding agreements to use the Platform. By using Firee, you represent and warrant that you meet these requirements.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text, white)", marginBottom: 8 }}>4. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and wallet private keys. Firee is not responsible for any unauthorized access to your account. You agree to notify us immediately of any breach of security.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text, white)", marginBottom: 8 }}>5. Purchases & Payments</h2>
            <p>All transactions are conducted in USDC on the Base blockchain via smart contract escrow. Payments are final once confirmed on-chain. A platform fee of 3% is deducted from each sale. Sellers receive 97% of the sale price.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text, white)", marginBottom: 8 }}>6. Seller Responsibilities</h2>
            <p>Sellers must ensure that their products do not violate any intellectual property rights, laws, or regulations. Sellers are responsible for the accuracy of their product descriptions and the quality of their deliverables.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text, white)", marginBottom: 8 }}>7. Prohibited Content</h2>
            <p>You may not list or distribute: malware, phishing tools, stolen code, products that violate intellectual property rights, illegal content, or any material that promotes harm or discrimination.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text, white)", marginBottom: 8 }}>8. Intellectual Property</h2>
            <p>Sellers retain ownership of their products. By listing on Firee, sellers grant buyers a license to use the purchased product as described. The Firee brand, logo, and platform code are owned by Firee.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text, white)", marginBottom: 8 }}>9. Limitation of Liability</h2>
            <p>Firee is provided &quot;as is&quot; without warranties of any kind. We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the Platform, including but not limited to loss of funds due to smart contract interactions.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text, white)", marginBottom: 8 }}>10. Modifications</h2>
            <p>We reserve the right to modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text, white)", marginBottom: 8 }}>11. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:support@firee.app" style={{ color: "var(--sky)" }}>support@firee.app</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
