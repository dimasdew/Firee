import { createClient } from "./client";
import type { DbOrder } from "./types";

const supabase = createClient();

export async function createOrder(order: {
  buyer_id: string;
  product_id: string;
  seller_id: string;
  price_usdc: number;
  platform_fee_usdc: number;
  seller_revenue_usdc: number;
  tx_hash: string;
}): Promise<DbOrder> {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      ...order,
      status: "completed",
    })
    .select("*, product:products(*)")
    .single();
  if (error) throw error;
  return data;
}

export async function getBuyerOrders(buyerId: string): Promise<DbOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, product:products(*, seller:profiles(*))")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getSellerOrders(sellerId: string): Promise<DbOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, product:products(*), buyer:profiles(*)")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/**
 * Generate a signed download URL for a purchased product file.
 * Only works if the buyer has a completed order for this product.
 */
export async function getDownloadUrl(
  buyerId: string,
  productId: string
): Promise<string | null> {
  // Verify buyer has purchased this product
  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("buyer_id", buyerId)
    .eq("product_id", productId)
    .eq("status", "completed")
    .single();

  if (!order) return null;

  // Get the product file_url (storage path)
  const { data: product } = await supabase
    .from("products")
    .select("file_url")
    .eq("id", productId)
    .single();

  if (!product?.file_url) return null;

  // Generate signed URL (valid for 1 hour)
  const { data, error } = await supabase.storage
    .from("products")
    .createSignedUrl(product.file_url, 3600);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
