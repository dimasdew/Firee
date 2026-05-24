import { createClient } from "./client";

export type DisputeStatus = "pending" | "approved" | "rejected";

export interface Dispute {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  reason: string;
  status: DisputeStatus;
  admin_note: string | null;
  created_at: string;
}

export async function createDispute(
  orderId: string,
  buyerId: string,
  sellerId: string,
  reason: string
): Promise<void> {
  const { error } = await createClient()
    .from("disputes")
    .insert({
      order_id: orderId,
      buyer_id: buyerId,
      seller_id: sellerId,
      reason,
      status: "pending",
    });
  if (error) throw error;
}

export async function getDisputeByOrder(orderId: string): Promise<Dispute | null> {
  const { data } = await createClient()
    .from("disputes")
    .select("*")
    .eq("order_id", orderId)
    .single();
  return data as Dispute | null;
}

export async function getBuyerDisputes(buyerId: string): Promise<Dispute[]> {
  const { data, error } = await createClient()
    .from("disputes")
    .select("*")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Dispute[]) ?? [];
}
