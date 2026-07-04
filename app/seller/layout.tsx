"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "../../components/Navbar";
import MobileBottomNav from "../../components/MobileBottomNav";
import AuthGuard from "../../components/AuthGuard";
import { useApp } from "../../context/AppContext";
import { Package, PlusCircle, DollarSign, BarChart3 } from "lucide-react";

const SELLER_NAV = [
  { href: "/seller", label: "My Products", icon: Package, exact: true },
  { href: "/seller/new", label: "Add Product", icon: PlusCircle },
  { href: "/seller/earnings", label: "Earnings", icon: DollarSign },
  { href: "/seller/analytics", label: "Analytics", icon: BarChart3 },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { user } = useApp();

  // H5: verified-seller gate — is_seller must be true (set by admin after approval)
  useEffect(() => {
    if (user && !(user as any).is_seller) {
      router.replace("/dashboard?seller_required=1");
    }
  }, [user, router]);

  return (
    <AuthGuard>
      <div className="page-shell">
        <Navbar variant="dashboard" />
        <main className="container" style={{ padding: "28px 0 48px" }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text, white)", marginBottom: 4 }}>
              Seller Dashboard
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Manage your digital products and earnings
            </p>
          </div>

          <nav style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }} aria-label="Seller navigation">
            {SELLER_NAV.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? path === href : path.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`sidebar-link ${active ? "active" : ""}`}
                  style={{ flex: "0 1 auto", minWidth: 120 }}
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

