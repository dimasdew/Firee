"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Firee Error:", error);
  }, [error]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <div style={{ maxWidth: 400 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <AlertTriangle size={28} color="#f87171" />
        </div>
        <h1 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 24, color: "var(--text, white)", marginBottom: 8 }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 24 }}>
          An unexpected error occurred. You can try again or go back to the home page.
        </p>
        {error.digest && (
          <p className="mono" style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 16, opacity: 0.6 }}>
            Error ID: {error.digest}
          </p>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button type="button" className="btn-sand" onClick={reset} style={{ gap: 6 }}>
            <RotateCcw size={13} /> Try Again
          </button>
          <Link href="/" className="btn-ghost" style={{ textDecoration: "none" }}>
            <Home size={13} /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
