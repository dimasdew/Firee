import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="page-shell" style={{ alignItems: "center", justifyContent: "center" }}>
      <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.15 }} />
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: 24 }}>
        <p className="mono" style={{ fontSize: "clamp(72px, 15vw, 120px)", fontWeight: 700, color: "rgba(110,172,218,0.12)", lineHeight: 1 }}>404</p>
        <h1 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(22px, 4vw, 32px)", color: "var(--text, white)", marginBottom: 8 }}>
          Page not found
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 28, maxWidth: 360, margin: "0 auto 28px" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn-sand"><ArrowLeft size={14} /> Home</Link>
          <Link href="/login" className="btn-ghost">Marketplace</Link>
        </div>
      </div>
    </div>
  );
}
