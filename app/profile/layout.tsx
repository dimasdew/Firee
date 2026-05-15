"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "../../components/Navbar";
import MobileBottomNav from "../../components/MobileBottomNav";
import { useApp } from "../../context/AppContext";
import { shortenAddress } from "../../lib/utils";
import { UserCircle, Wallet } from "lucide-react";

const SIDEBAR = [
  { href: "/profile", label: "Profile", icon: UserCircle, exact: true },
  { href: "/profile/wallet", label: "Wallet", icon: Wallet },
];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { user } = useApp();
  const username = user?.username ?? "dimasdew";
  const initial = username[0]?.toUpperCase() ?? "D";

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
            <p style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 18, color: "var(--text, white)" }}>@{username}</p>
            <p className="mono" style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
              {user?.walletAddress ? shortenAddress(user.walletAddress) : "Wallet not connected"}
            </p>
          </div>
        </div>
        <div className="divider" style={{ marginBottom: 24 }} />
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>My Account</p>
        <div className="profile-layout">
          <nav className="profile-sidebar" aria-label="Profile navigation">
            {SIDEBAR.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? path === href : path === href;
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
