"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "../../components/Navbar";
import MobileBottomNav from "../../components/MobileBottomNav";
import { useApp } from "../../context/AppContext";
import { shortenAddress, timeAgo } from "../../lib/utils";
import { UserCircle, Wallet, MapPin, Calendar, Mail, Shield, Link2 } from "lucide-react";

const SIDEBAR = [
  { href: "/profile", label: "Profile", icon: UserCircle, exact: true },
  { href: "/profile/address", label: "Address", icon: MapPin },
  { href: "/profile/wallet", label: "Wallet", icon: Wallet },
];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { user } = useApp();
  const username = user?.username ?? "dimasdew";
  const displayName = user?.displayName || username;
  const initial = displayName[0]?.toUpperCase() ?? "D";
  const joinedLabel = user?.joinedAt ? timeAgo(user.joinedAt) : "Just now";
  const providerLabel = user?.authProvider === "google" ? "Google" : user?.authProvider === "wallet" ? "Wallet" : "Email";

  return (
    <div className="page-shell">
      <Navbar variant="dashboard" />
      <div className="profile-banner">
        <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.3 }} />
      </div>
      <div className="container">
        <div className="profile-avatar-row">
          <div className="profile-avatar">{initial}</div>
          <div style={{ paddingBottom: 4, flex: 1 }}>
            <p style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 18, color: "var(--text, white)" }}>
              {displayName}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              @{username}
            </p>
          </div>
        </div>

        {/* Info strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, margin: "16px 0 24px" }}>
          <div className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <Mail size={14} color="var(--sky)" style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</p>
              <p style={{ fontSize: 12, color: "var(--text, white)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email ?? "—"}</p>
            </div>
          </div>
          <div className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <Link2 size={14} color="var(--sky)" style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Wallet</p>
              <p className="mono" style={{ fontSize: 12, color: user?.walletAddress ? "var(--sand)" : "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.walletAddress ? shortenAddress(user.walletAddress) : "Not connected"}
              </p>
            </div>
          </div>
          <div className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <Calendar size={14} color="var(--sky)" style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Joined</p>
              <p style={{ fontSize: 12, color: "var(--text, white)" }}>{joinedLabel}</p>
            </div>
          </div>
          <div className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <Shield size={14} color="var(--sky)" style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Auth</p>
              <p style={{ fontSize: 12, color: "var(--text, white)" }}>{providerLabel}</p>
            </div>
          </div>
        </div>

        <div className="divider" style={{ marginBottom: 24 }} />
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>My Account</p>
        <div className="profile-layout">
          <nav className="profile-sidebar" aria-label="Profile navigation">
            {SIDEBAR.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? path === href : path.startsWith(href) && !exact;
              return (
                <Link key={href} href={href} className={`sidebar-link ${active ? "active" : ""}`}>
                  <Icon size={14} /> {label}
                </Link>
              );
            })}
          </nav>
          <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
