"use client";

import { useApp } from "../context/AppContext";
import { CheckCircle2 } from "lucide-react";

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      <CheckCircle2 size={16} color="var(--sand)" />
      <span>{toast}</span>
    </div>
  );
}
