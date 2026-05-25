import { createClient } from "./client";
import type { Profile, DbProduct, DbOrder } from "./types";

function getClient() { return createClient(); }

export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data: { user } } = await getClient().auth.getUser();
  if (!user) return false;
  const { data } = await getClient()
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  return data?.is_admin === true;
}

export async function adminGetAllUsers(): Promise<Profile[]> {
  const { data, error } = await getClient().rpc("admin_get_all_users");
  if (error) throw error;
  return data ?? [];
}

export async function adminGetAllProducts(): Promise<DbProduct[]> {
  const { data, error } = await getClient()
    .from("products")
    .select("*, seller:profiles(id, username, display_name, email), category:categories(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminGetAllOrders(): Promise<DbOrder[]> {
  const { data, error } = await getClient()
    .from("orders")
    .select("*, product:products(id, title), buyer:profiles(id, username, display_name), seller:profiles!orders_seller_id_fkey(id, username, display_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminDeleteProduct(productId: string): Promise<void> {
  const { error } = await getClient().rpc("admin_delete_product", { p_id: productId });
  if (error) throw error;
}

export async function adminToggleBan(userId: string, ban: boolean): Promise<void> {
  const { error } = await getClient()
    .from("profiles")
    .update({ is_banned: ban })
    .eq("id", userId);
  if (error) throw error;
}

export async function adminToggleProductPublish(productId: string, publish: boolean): Promise<void> {
  const { error } = await getClient()
    .from("products")
    .update({ is_published: publish })
    .eq("id", productId);
  if (error) throw error;
}

// Seller verification
export async function adminVerifySeller(userId: string, verified: boolean): Promise<void> {
  const { error } = await getClient()
    .from("profiles")
    .update({ seller_verified: verified } as any)
    .eq("id", userId);
  if (error) throw error;
}

// Reports management
export interface AdminReport {
  id: string;
  product_id: string;
  reporter_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  product?: { id: string; title: string; thumbnail_url: string | null };
  reporter?: { id: string; username: string; display_name: string | null };
}

export async function adminGetAllReports(): Promise<AdminReport[]> {
  const { data, error } = await getClient()
    .from("reports")
    .select("*, product:products(id, title, thumbnail_url), reporter:profiles!reports_reporter_id_fkey(id, username, display_name)")
    .order("created_at", { ascending: false });
  if (error) {
    // Fallback without join if FK name differs
    const { data: d2, error: e2 } = await getClient()
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (e2) throw e2;
    return (d2 ?? []) as AdminReport[];
  }
  return (data ?? []) as AdminReport[];
}

export async function adminUpdateReportStatus(reportId: string, status: string): Promise<void> {
  const { error } = await getClient()
    .from("reports")
    .update({ status } as any)
    .eq("id", reportId);
  if (error) throw error;
}

// Disputes management
export interface AdminDispute {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  reason: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  buyer?: { id: string; username: string; display_name: string | null };
  seller?: { id: string; username: string; display_name: string | null };
}

export async function adminGetAllDisputes(): Promise<AdminDispute[]> {
  const { data, error } = await getClient()
    .from("disputes")
    .select("*, buyer:profiles!disputes_buyer_id_fkey(id, username, display_name), seller:profiles!disputes_seller_id_fkey(id, username, display_name)")
    .order("created_at", { ascending: false });
  if (error) {
    const { data: d2, error: e2 } = await getClient()
      .from("disputes")
      .select("*")
      .order("created_at", { ascending: false });
    if (e2) throw e2;
    return (d2 ?? []) as AdminDispute[];
  }
  return (data ?? []) as AdminDispute[];
}

export async function adminUpdateDispute(disputeId: string, status: string, adminNote?: string): Promise<void> {
  const update: any = { status };
  if (adminNote !== undefined) update.admin_note = adminNote;
  const { error } = await getClient()
    .from("disputes")
    .update(update)
    .eq("id", disputeId);
  if (error) throw error;
}
