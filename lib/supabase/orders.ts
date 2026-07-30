import { createClient } from "./client";
import type { DbOrder } from "./types";

function getClient() { return createClient(); }

export interface ShippingInfo {
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  shipping_phone?: string;
}

export async function createOrder(order: {
  buyer_id: string;
  product_id: string;
  seller_id: string;
  price_usdc: number;
  platform_fee_usdc: number;
  seller_revenue_usdc: number;
  tx_hash: string;
  escrow_order_id?: string | null;
  shipping?: ShippingInfo;
}): Promise<DbOrder> {
  // C2: Verify price from DB — never trust client-supplied price
  const { data: product } = await getClient()
    .from("products")
    .select("price_usdc, seller_id, shipping_fee_usdc")
    .eq("id", order.product_id)
    .single();

  if (!product) throw new Error("Product not found");
  if (product.seller_id !== order.seller_id) throw new Error("Seller mismatch");

  const totalPaid = product.price_usdc + (product.shipping_fee_usdc ?? 0);
  const fee = +(totalPaid * 0.03).toFixed(6);
  const sellerRevenue = +(totalPaid - fee).toFixed(6);

  const { data, error } = await getClient()
    .from("orders")
    .insert({
      buyer_id: order.buyer_id,
      product_id: order.product_id,
      seller_id: order.seller_id,
      price_usdc: product.price_usdc,       // from DB, not client
      platform_fee_usdc: fee,               // recalculated server-side
      seller_revenue_usdc: sellerRevenue,   // recalculated server-side
      tx_hash: order.tx_hash,
      escrow_order_id: order.escrow_order_id ?? null,
      status: "paid", // physical goods: waiting for seller to ship
      ...(order.shipping ?? {}),
    })
    .select("*, product:products(*)")
    .single();
  if (error) throw error;
  return data;
}

export async function getBuyerOrders(buyerId: string): Promise<DbOrder[]> {
  const { data, error } = await getClient()
    .from("orders")
    .select("*, product:products(id, title, thumbnail_url, file_url, seller_id, seller:profiles(id, username, display_name, avatar_url))")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getSellerOrders(sellerId: string): Promise<DbOrder[]> {
  const { data, error } = await getClient()
    .from("orders")
    .select("*, product:products(id, title, thumbnail_url), buyer:profiles(id, username, display_name)")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/**
 * Seller marks an order as shipped with a tracking number.
 */
export async function markOrderShipped(
  sellerId: string,
  orderId: string,
  trackingNumber: string,
  carrier?: string
): Promise<void> {
  const { error } = await getClient()
    .from("orders")
    .update({
      status: "shipped",
      tracking_number: trackingNumber,
      shipping_carrier: carrier ?? null,
      shipped_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("seller_id", sellerId)
    .eq("status", "paid");
  if (error) throw error;
}

/**
 * Buyer confirms the item arrived. Mirrors on-chain confirmDelivery.
 */
export async function confirmOrderDelivered(
  buyerId: string,
  orderId: string
): Promise<void> {
  const { error } = await getClient()
    .from("orders")
    .update({
      status: "delivered",
      delivered_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("buyer_id", buyerId)
    .eq("status", "shipped");
  if (error) throw error;
}

/**
 * Generate a signed download URL for a purchased product file.
 * Verifies buyer has a completed order for this product before issuing URL.
 */
export async function getDownloadUrl(
  buyerId: string,
  productId: string
): Promise<string | null> {
  const { data: order } = await getClient()
    .from("orders")
    .select("id")
    .eq("buyer_id", buyerId)
    .eq("product_id", productId)
    .eq("status", "completed")
    .single();

  if (!order) return null;

  const { data: product } = await getClient()
    .from("products")
    .select("file_url")
    .eq("id", productId)
    .single();

  if (!product?.file_url) return null;

  const { data, error } = await getClient().storage
    .from("products")
    .createSignedUrl(product.file_url, 3600);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
