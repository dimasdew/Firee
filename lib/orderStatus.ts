// Single source of truth for order status presentation.
// Buyer, seller, and admin views all read from here so a state never shows a
// different colour or label depending on where you look at it.

export type OrderStatus =
  | "paid"
  | "shipped"
  | "delivered"
  | "completed"
  | "refunded"
  | "disputed";

type StatusStyle = {
  /** Semantic badge variant — see .badge-* in app/globals.css */
  variant: "badge-info" | "badge-warn" | "badge-success" | "badge-danger" | "badge-neutral";
  /** What the buyer sees */
  buyerLabel: string;
  /** What the seller sees — differs only where the required action differs */
  sellerLabel: string;
};

const STATUS_MAP: Record<OrderStatus, StatusStyle> = {
  paid:      { variant: "badge-warn",    buyerLabel: "Awaiting Shipment", sellerLabel: "To Ship" },
  shipped:   { variant: "badge-info",    buyerLabel: "Shipped",           sellerLabel: "Shipped" },
  delivered: { variant: "badge-success", buyerLabel: "Delivered",         sellerLabel: "Delivered" },
  completed: { variant: "badge-success", buyerLabel: "Delivered",         sellerLabel: "Delivered" },
  refunded:  { variant: "badge-neutral", buyerLabel: "Refunded",          sellerLabel: "Refunded" },
  disputed:  { variant: "badge-danger",  buyerLabel: "Disputed",          sellerLabel: "Disputed" },
};

export function orderStatusStyle(status: string): StatusStyle {
  return STATUS_MAP[status as OrderStatus] ?? {
    variant: "badge-neutral",
    buyerLabel: status,
    sellerLabel: status,
  };
}

export function orderStatusClass(status: string): string {
  return orderStatusStyle(status).variant;
}

/** Payout status — seller earnings page. */
export function payoutStatusClass(status: string): string {
  if (status === "completed") return "badge-success";
  if (status === "failed") return "badge-danger";
  return "badge-warn"; // pending, processing
}

/** Dispute status — admin disputes page. */
export function disputeStatusClass(status: string): string {
  if (status === "approved") return "badge-success";
  if (status === "rejected") return "badge-danger";
  return "badge-warn"; // pending
}
