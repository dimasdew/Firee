"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, User, ClipboardList, Store, type LucideIcon } from "lucide-react";

const LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Shop", icon: LayoutGrid },
  { href: "/order", label: "Orders", icon: ClipboardList },
  { href: "/seller", label: "Sell", icon: Store },
  { href: "/profile", label: "Profile", icon: User },
];

export default function MobileBottomNav() {
  const path = usePathname();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active =
          path === href ||
          (href === "/profile" && path.startsWith("/profile")) ||
          (href === "/order" && path.startsWith("/order")) ||
          (href === "/seller" && path.startsWith("/seller"));
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
