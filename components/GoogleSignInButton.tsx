"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useApp } from "../context/AppContext";

const GOOGLE_ACCOUNTS = [
  { email: "dimasdew@gmail.com", name: "Dimas Dew", color: "#6EACDA" },
  { email: "firee.demo@gmail.com", name: "Firee Demo", color: "#E2E2B6" },
];

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

interface Props {
  mode?: "signin" | "signup";
  redirectTo?: string;
}

export default function GoogleSignInButton({ mode = "signin", redirectTo = "/dashboard" }: Props) {
  const router = useRouter();
  const { loginWithGoogle } = useApp();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const label = mode === "signup" ? "Sign up with Google" : "Continue with Google";

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const pickAccount = (email: string, name: string) => {
    setLoading(true);
    setOpen(false);
    setTimeout(() => {
      if (loginWithGoogle(email, name)) router.push(redirectTo);
      setLoading(false);
    }, 400);
  };

  return (
    <>
      <button
        type="button"
        className="btn-google"
        disabled={loading}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <GoogleLogo />
        {loading ? "Connecting…" : label}
      </button>

      {open && (
        <>
          <div className="drawer-backdrop" onClick={() => setOpen(false)} aria-hidden />
          <div
            className="google-picker"
            role="dialog"
            aria-labelledby="google-picker-title"
            aria-modal="true"
          >
            <div className="google-picker-header">
              <GoogleLogo />
              <div>
                <p id="google-picker-title" style={{ fontWeight: 600, fontSize: 14, color: "var(--text, white)" }}>
                  Sign in with Google
                </p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Choose an account to continue to Firee</p>
              </div>
              <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="google-picker-list">
              {GOOGLE_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  className="google-account-row"
                  onClick={() => pickAccount(acc.email, acc.name)}
                >
                  <span className="google-account-avatar" style={{ background: acc.color }}>
                    {acc.name.charAt(0)}
                  </span>
                  <span style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text, white)" }}>{acc.name}</span>
                    <span style={{ display: "block", fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis" }}>{acc.email}</span>
                  </span>
                </button>
              ))}
            </div>

            <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
              Demo mode — picks a Google account locally (no OAuth server required).
            </p>
          </div>
        </>
      )}
    </>
  );
}
