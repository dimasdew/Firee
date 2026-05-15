"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, User, ClipboardList, ShoppingBag, type LucideIcon } from "lucide-react";
import { useApp } from "../context/AppContext";

const LINKS: { href: string; label: string; icon: LucideIcon; action?: "cart" }[] = [
  { href: "/dashboard", label: "Shop", icon: LayoutGrid },
  { href: "/order", label: "Orders", icon: ClipboardList },
  { href: "#cart", label: "Cart", icon: ShoppingBag, action: "cart" },
  { href: "/profile", label: "Profile", icon: User },
];

export default function MobileBottomNav() {
  const path = usePathname();
  const { setCartDrawerOpen } = useApp();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {LINKS.map(({ href, label, icon: Icon, action }) => {
        if (action === "cart") {
          return (
            <button
              key={label}
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 10, color: "rgba(110,172,218,0.45)" }}
            >
              <Icon size={18} />
              {label}
            </button>
          );
        }
        const active =
          path === href ||
          (href === "/profile" && path.startsWith("/profile")) ||
          (href === "/order" && (path === "/order" || path.startsWith("/order/")));
        return (
          <Link key={href} href={href} className={active ? "active" : ""}>
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
