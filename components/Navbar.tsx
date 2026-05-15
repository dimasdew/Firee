"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search, Bell, User, HelpCircle, Wallet, LogOut, Flame,
  ChevronDown, Package, CheckCircle2, Sun, Moon, Menu, X, ShoppingBag,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { timeAgo, shortenAddress } from "../lib/utils";
import CartDrawer from "./CartDrawer";
import FireeConnectButton from "./FireeConnectButton";

interface NavbarProps {
  variant?: "landing" | "dashboard";
  onSearch?: (val: string) => void;
}

const LANDING_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How it Works" },
  { href: "/dashboard", label: "Marketplace" },
  { href: "/about", label: "About" },
];

export default function Navbar({ variant = "landing", onSearch }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    user, notifications, unreadCount, cartCount, markAllNotificationsRead,
    logout, disconnectWallet, cartDrawerOpen, setCartDrawerOpen,
  } = useApp();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("firee-theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("firee-theme", next);
  };

  const isDark = theme === "dark";
  const navText = isDark ? "rgba(200,216,232,0.7)" : "rgba(2,21,38,0.65)";
  const username = user?.username ?? "guest";
  const wallet = user?.walletAddress;

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    router.push("/");
  };

  const notifIcon = (type: string) => {
    if (type === "order") return <Package size={13} color="var(--sky)" />;
    if (type === "wallet") return <Wallet size={13} color="var(--sand)" />;
    return <Bell size={13} color="rgba(110,172,218,0.5)" />;
  };

  return (
    <>
      <nav className="nav sticky top-0 z-50" ref={navRef}>
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <span className="nav-logo-icon"><Flame size={15} color="var(--midnight)" /></span>
            <span className="nav-logo-text">Firee</span>
          </Link>

          {variant === "landing" ? (
            <>
              <div className="nav-links-desktop">
                {LANDING_LINKS.map((l) => (
                  <Link key={l.href} href={l.href} style={{ fontSize: 13, color: navText, textDecoration: "none" }}>{l.label}</Link>
                ))}
              </div>
              <div className="nav-actions">
                <button type="button" onClick={toggleTheme} className="icon-btn" aria-label="Toggle theme">
                  {isDark ? <Sun size={14} /> : <Moon size={14} />}
                </button>
                <Link href="/login" className="nav-link-hide-mobile" style={{ fontSize: 13, color: navText, textDecoration: "none" }}>Login</Link>
                <Link href="/create" className="btn-ghost" style={{ fontSize: 12 }}>Create Account</Link>
                <button type="button" className="icon-btn nav-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
                  {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="nav-link-hide-mobile" style={{ fontSize: 13, color: navText, textDecoration: "none", flexShrink: 0 }}>Dashboard</Link>
              <div className="search-wrap nav-search">
                <Search size={14} className="search-icon" />
                <input type="search" placeholder="Search products..." onChange={(e) => onSearch?.(e.target.value)} aria-label="Search products" />
              </div>
              <div className="nav-actions">
                <button type="button" onClick={toggleTheme} className="icon-btn" aria-label="Toggle theme">
                  {isDark ? <Sun size={14} /> : <Moon size={14} />}
                </button>
                <button type="button" className="icon-btn cart-btn" onClick={() => setCartDrawerOpen(true)} aria-label="Open cart">
                  <ShoppingBag size={14} />
                  {cartCount > 0 && <span className="cart-badge">{cartCount > 9 ? "9+" : cartCount}</span>}
                </button>

                {!wallet && (
                  <div className="nav-link-hide-mobile">
                    <FireeConnectButton variant="nav" label="Connect" />
                  </div>
                )}

                <div className="dropdown-wrap">
                  <button type="button" className="icon-btn" onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }} aria-label="Notifications">
                    <Bell size={14} />
                    {unreadCount > 0 && <span className="notif-dot" />}
                  </button>
                  {notifOpen && (
                    <div className="dropdown-panel notif-panel">
                      <div className="dropdown-header">
                        <p>Notifications</p>
                        {unreadCount > 0 && <span className="badge badge-sky" style={{ fontSize: 9 }}>{unreadCount} new</span>}
                      </div>
                      {notifications.slice(0, 6).map((n, i) => (
                        <div key={n.id} className={`dropdown-item ${n.unread ? "unread" : ""}`} style={{ borderBottom: i < 5 ? "1px solid var(--border)" : "none" }}>
                          <span className="dropdown-item-icon">{notifIcon(n.type)}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                              <p style={{ fontSize: 12, fontWeight: 600 }}>{n.title}</p>
                              <span style={{ fontSize: 10, opacity: 0.5, flexShrink: 0 }}>{timeAgo(n.time)}</span>
                            </div>
                            <p style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{n.desc}</p>
                          </div>
                        </div>
                      ))}
                      <button type="button" className="dropdown-footer-btn" onClick={markAllNotificationsRead}>Mark all as read</button>
                    </div>
                  )}
                </div>

                <div className="dropdown-wrap">
                  <button type="button" className="profile-trigger" onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}>
                    <span className="avatar-sm">{username[0]?.toUpperCase()}</span>
                    <ChevronDown size={12} className="nav-link-hide-mobile" />
                  </button>
                  {profileOpen && (
                    <div className="dropdown-panel profile-panel">
                      <div className="dropdown-header" style={{ flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                        <p style={{ fontWeight: 600 }}>{username}</p>
                        <p className="mono" style={{ fontSize: 10, opacity: 0.5 }}>{wallet ? shortenAddress(wallet) : "No wallet connected"}</p>
                      </div>
                      <div style={{ padding: 6 }}>
                        {[
                          { icon: <User size={13} />, label: "Profile", href: "/profile" },
                          { icon: <Package size={13} />, label: "Orders", href: "/order" },
                          { icon: <Wallet size={13} />, label: "Wallet", href: "/profile/wallet" },
                          { icon: <HelpCircle size={13} />, label: "Support", href: "/support" },
                        ].map((item) => (
                          <Link key={item.label} href={item.href} className="dropdown-menu-link" onClick={() => setProfileOpen(false)}>
                            {item.icon} {item.label}
                          </Link>
                        ))}
                        <div className="divider" style={{ margin: "6px 0" }} />
                        {wallet ? (
                          <button type="button" className="btn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: 12, marginBottom: 4 }} onClick={disconnectWallet}>
                            Disconnect Wallet
                          </button>
                        ) : (
                          <div style={{ marginBottom: 4 }} onClick={() => setProfileOpen(false)}>
                            <FireeConnectButton fullWidth label="Connect Wallet" />
                          </div>
                        )}
                        <button type="button" className="logout-btn" onClick={handleLogout}>
                          <LogOut size={13} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button type="button" className="icon-btn nav-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
                  {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </div>
            </>
          )}
        </div>

        {mobileOpen && (
          <div className="mobile-nav">
            {variant === "landing" ? (
              <>
                {LANDING_LINKS.map((l) => (
                  <Link key={l.href} href={l.href}>{l.label}</Link>
                ))}
                <Link href="/login">Login</Link>
                <Link href="/create" className="btn-primary" style={{ justifyContent: "center" }}>Create Account</Link>
              </>
            ) : (
              <>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/profile">Profile</Link>
                <Link href="/order">Orders</Link>
                <Link href="/profile/wallet">Wallet</Link>
                <button type="button" className="btn-ghost" style={{ justifyContent: "center" }} onClick={() => { setCartDrawerOpen(true); setMobileOpen(false); }}>
                  <ShoppingBag size={14} /> Cart ({cartCount})
                </button>
                <Link href="/support">Support</Link>
              </>
            )}
          </div>
        )}
      </nav>

      <CartDrawer open={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </>
  );
}
