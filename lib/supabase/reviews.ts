import { createClient } from "./client";
import type { Review } from "./types";

const supabase = createClient();

export async function getProductReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, buyer:profiles(id, username, display_name, avatar_url)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getProductAvgRating(productId: string): Promise<{ avg: number; count: number }> {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId);
  if (error) return { avg: 0, count: 0 };
  if (!data || data.length === 0) return { avg: 0, count: 0 };
  const sum = data.reduce((s, r) => s + r.rating, 0);
  return { avg: sum / data.length, count: data.length };
}

export async function getMultipleProductRatings(
  productIds: string[]
): Promise<Record<string, { avg: number; count: number }>> {
  if (productIds.length === 0) return {};
  const { data, error } = await supabase
    .from("reviews")
    .select("product_id, rating")
    .in("product_id", productIds);
  if (error) return {};
  const map: Record<string, { sum: number; count: number }> = {};
  for (const r of data ?? []) {
    if (!map[r.product_id]) map[r.product_id] = { sum: 0, count: 0 };
    map[r.product_id].sum += r.rating;
    map[r.product_id].count += 1;
  }
  const result: Record<string, { avg: number; count: number }> = {};
  for (const [id, val] of Object.entries(map)) {
    result[id] = { avg: val.sum / val.count, count: val.count };
  }
  return result;
}

export async function createReview(review: {
  order_id: string;
  buyer_id: string;
  product_id: string;
  rating: number;
  comment?: string;
}): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .insert(review)
    .select("*, buyer:profiles(id, username, display_name, avatar_url)")
    .single();
  if (error) throw error;
  return data;
}

export async function getBuyerReviewForOrder(
  buyerId: string,
  orderId: string
): Promise<Review | null> {
  const { data } = await supabase
    .from("reviews")
    .select("*, buyer:profiles(id, username, display_name, avatar_url)")
    .eq("buyer_id", buyerId)
    .eq("order_id", orderId)
    .single();
  return data ?? null;
}
