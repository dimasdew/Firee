"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useApp } from "../context/AppContext";
import UsdcAmount from "./UsdcAmount";
import type { Product } from "../lib/types";

interface Props extends Pick<Product, "id" | "name" | "price" | "category" | "emoji"> {}

export default function ProductCard({ id, name, price, category, emoji }: Props) {
  const { addToCart } = useApp();

  return (
    <article className="card card-lift" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <span className="badge badge-sky" style={{ fontSize: 9, padding: "2px 7px" }}>
          {category}
        </span>
      </div>

      <div style={{ padding: "16px 14px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: "var(--text, white)" }}>{name}</p>
        <div style={{ width: 72, height: 88, borderRadius: 8, background: "rgba(110,172,218,0.06)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 12 }}>
          {emoji}
        </div>
        <UsdcAmount value={price} showLabel={false} iconSize={13} style={{ color: "var(--sand)", fontWeight: 600, fontSize: 13 }} />
      </div>

      <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
        <Link
          href={`/dashboard/details?id=${id}`}
          style={{ flex: 1, textAlign: "center", padding: 8, borderRadius: 6, background: "rgba(226,226,182,0.08)", border: "1px solid rgba(226,226,182,0.15)", color: "var(--sand)", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
        >
          View
        </Link>
        <button
          type="button"
          onClick={() => addToCart(id)}
          aria-label={`Add ${name} to cart`}
          style={{ width: 36, height: 36, borderRadius: 6, border: "1px solid var(--border)", background: "rgba(110,172,218,0.08)", color: "var(--sky)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <ShoppingCart size={14} />
        </button>
      </div>
    </article>
  );
}
