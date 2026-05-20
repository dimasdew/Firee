import { createClient } from "./client";

function getClient() { return createClient(); }

export interface WishlistEntry {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export async function getWishlist(userId: string): Promise<WishlistEntry[]> {
  const { data, error } = await getClient()
    .from("wishlists")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addToWishlist(userId: string, productId: string): Promise<WishlistEntry> {
  const { data, error } = await getClient()
    .from("wishlists")
    .insert({ user_id: userId, product_id: productId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
  const { error } = await getClient()
    .from("wishlists")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
  if (error) throw error;
}
