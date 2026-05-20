"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import MobileBottomNav from "../../components/MobileBottomNav";
import AuthGuard from "../../components/AuthGuard";
import { isCurrentUserAdmin } from "../../lib/supabase/admin";
import { Users, Package, ShoppingCart, Shield, Loader2 } from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin", label: "Users", icon: Users, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    isCurrentUserAdmin().then((isAdmin) => {
      if (!isAdmin) {
        router.push("/dashboard");
      } else {
        setAuthorized(true);
      }
    });
  }, [router]);

  if (authorized === null) {
    return (
      <AuthGuard>
        <div className="page-shell">
          <Navbar variant="dashboard" />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
            <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "var(--sky)" }} />
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="page-shell">
        <Navbar variant="dashboard" />
        <main className="container" style={{ padding: "28px 0 48px" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Shield size={18} color="var(--sand)" />
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text, white)" }}>
                Admin Panel
              </h1>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Manage users, products, and orders
            </p>
          </div>

          <nav style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }} aria-label="Admin navigation">
            {ADMIN_NAV.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? path === href : path.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`sidebar-link ${active ? "active" : ""}`}
                  style={{ flex: "0 1 auto", minWidth: 100 }}
                >
                  <Icon size={14} /> {label}
                </Link>
              );
            })}
          </nav>

          {children}
        </main>
        <MobileBottomNav />
      </div>
    </AuthGuard>
  );
}
