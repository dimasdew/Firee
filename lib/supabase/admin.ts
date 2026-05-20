import { createClient } from "./client";
import type { Profile, DbProduct, DbOrder } from "./types";

const supabase = createClient();

export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  return data?.is_admin === true;
}

export async function adminGetAllUsers(): Promise<Profile[]> {
  const { data, error } = await supabase.rpc("admin_get_all_users");
  if (error) throw error;
  return data ?? [];
}

export async function adminGetAllProducts(): Promise<DbProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, seller:profiles(id, username, display_name, email), category:categories(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminGetAllOrders(): Promise<DbOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, product:products(id, title), buyer:profiles(id, username, display_name), seller:profiles!orders_seller_id_fkey(id, username, display_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminDeleteProduct(productId: string): Promise<void> {
  const { error } = await supabase.rpc("admin_delete_product", { p_id: productId });
  if (error) throw error;
}

export async function adminToggleBan(userId: string, ban: boolean): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ is_banned: ban })
    .eq("id", userId);
  if (error) throw error;
}

export async function adminToggleProductPublish(productId: string, publish: boolean): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ is_published: publish })
    .eq("id", productId);
  if (error) throw error;
}
