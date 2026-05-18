import { createClient } from "./client";
import type { DbProduct, Category } from "./types";

const supabase = createClient();

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getPublishedProducts(): Promise<DbProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, seller:profiles(*), category:categories(*)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getProductBySlug(sellerSlug: string, slug: string): Promise<DbProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*, seller:profiles(*), category:categories(*)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  if (error) return null;
  return data;
}

export async function getSellerProducts(sellerId: string): Promise<DbProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createProduct(product: {
  seller_id: string;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  price_usdc: number;
  category_id: number;
  thumbnail_url?: string;
  file_url?: string;
  file_name?: string;
  file_size_bytes?: number;
  tags?: string[];
  is_published?: boolean;
}): Promise<DbProduct> {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<DbProduct, "id" | "seller_id" | "created_at">>
): Promise<DbProduct> {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function uploadThumbnail(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("thumbnails")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("thumbnails").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadProductFile(userId: string, file: File): Promise<{ url: string; name: string; size: number }> {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("products")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  // Private bucket — generate signed URL only after purchase
  return { url: path, name: file.name, size: file.size };
}
