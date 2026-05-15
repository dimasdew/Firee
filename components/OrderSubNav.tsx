"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, ShoppingBag } from "lucide-react";

const TABS = [
  { href: "/order", label: "Order Sekarang", icon: ShoppingBag, exact: true },
  { href: "/order/previous", label: "Previous Order", icon: ClipboardList },
];

export default function OrderSubNav() {
  const path = usePathname();

  return (
    <nav
      className="order-subnav"
      aria-label="Order navigation"
      style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}
    >
      {TABS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`sidebar-link ${active ? "active" : ""}`}
            style={{ flex: "1 1 auto", justifyContent: "center", minWidth: 140 }}
          >
            <Icon size={14} /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
