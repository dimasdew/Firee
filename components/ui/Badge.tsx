import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one badge/pill primitive.
 *
 * Every surface used to write `className="badge badge-sky"` and then paste
 * `style={{ fontSize: 9 }}` to shrink it — which is why the base badge was
 * 11px but almost nothing rendered at 11px. Size is a prop now; the visual
 * classes still live in app/globals.css so this changes no styling.
 */

export type BadgeTone =
  | "sky"
  | "sand"
  | "green"
  | "info"
  | "warn"
  | "success"
  | "danger"
  | "neutral";

type BadgeSize = "sm" | "md";

interface BadgeProps {
  tone?: BadgeTone;
  size?: BadgeSize;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = "sky", size = "sm", className, children }: BadgeProps) {
  return (
    <span className={cn("badge", `badge-${tone}`, size === "sm" && "badge-sm", className)}>
      {children}
    </span>
  );
}
