import { createClient } from "./client";
import type { DbProduct, Category } from "./types";

function getClient() { return createClient(); }

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await getClient()
    .from("categories")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getPublishedProducts(): Promise<DbProduct[]> {
  const { data, error } = await getClient()
    .from("products")
    .select("*, seller:profiles(*), category:categories(*)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export interface SearchProductsParams {
  search?: string;
  category?: string;
  tag?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: "name" | "price-asc" | "price-desc" | "rating" | "newest";
  page?: number;
  pageSize?: number;
}

export interface SearchProductsResult {
  products: DbProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function searchProducts(params: SearchProductsParams = {}): Promise<SearchProductsResult> {
  const {
    search = "",
    category,
    tag,
    priceMin,
    priceMax,
    sort = "newest",
    page = 1,
    pageSize = 12,
  } = params;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = getClient()
    .from("products")
    .select("*, seller:profiles(*), category:categories(*)", { count: "exact" })
    .eq("is_published", true);

  // Full-text search on title, description, tags
  if (search.trim()) {
    const term = search.trim().toLowerCase();
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,short_description.ilike.%${term}%`);
  }

  // Category filter
  if (category && category !== "All") {
    // Look up category id from name
    const { data: cat } = await getClient()
      .from("categories")
      .select("id")
      .eq("name", category)
      .single();
    if (cat) {
      query = query.eq("category_id", cat.id);
    }
  }

  // Tag filter
  if (tag) {
    query = query.contains("tags", [tag]);
  }

  // Price range
  if (priceMin !== undefined && priceMin > 0) {
    query = query.gte("price_usdc", priceMin);
  }
  if (priceMax !== undefined && priceMax < Infinity) {
    query = query.lte("price_usdc", priceMax);
  }

  // Sort
  if (sort === "price-asc") query = query.order("price_usdc", { ascending: true });
  else if (sort === "price-desc") query = query.order("price_usdc", { ascending: false });
  else if (sort === "name") query = query.order("title", { ascending: true });
  else query = query.order("created_at", { ascending: false }); // newest (default) + rating (sorted client-side)

  // Pagination
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  const total = count ?? 0;

  return {
    products: data ?? [],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getProductById(id: string): Promise<DbProduct | null> {
  const { data, error } = await getClient()
    .from("products")
    .select("*, seller:profiles(*), category:categories(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function getProductBySlug(sellerSlug: string, slug: string): Promise<DbProduct | null> {
  const { data, error } = await getClient()
    .from("products")
    .select("*, seller:profiles(*), category:categories(*)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  if (error) return null;
  return data;
}

export async function getSellerProducts(sellerId: string): Promise<DbProduct[]> {
  const { data, error } = await getClient()
    .from("products")
    .select("*, category:categories(*)")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getSellerPublishedProducts(sellerId: string): Promise<DbProduct[]> {
  const { data, error } = await getClient()
    .from("products")
    .select("*, seller:profiles(*), category:categories(*)")
    .eq("seller_id", sellerId)
    .eq("is_published", true)
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
  const { data, error } = await getClient()
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
  const { data, error } = await getClient()
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await getClient()
    .from("products")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_PRODUCT_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export async function uploadThumbnail(userId: string, file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`Invalid image type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF, SVG.`);
  }
  if (file.size > MAX_THUMBNAIL_SIZE) {
    throw new Error(`Thumbnail too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 5MB.`);
  }
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await getClient().storage
    .from("thumbnails")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = getClient().storage.from("thumbnails").getPublicUrl(path);
  return data.publicUrl;
}

const BLOCKED_EXTENSIONS = ["exe", "bat", "cmd", "sh", "msi", "dll", "com", "scr", "pif", "vbs", "js", "jar"];

export async function uploadProductFile(userId: string, file: File): Promise<{ url: string; name: string; size: number }> {
  if (file.size > MAX_PRODUCT_FILE_SIZE) {
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 50MB.`);
  }
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    throw new Error(`File type .${ext} is not allowed for security reasons.`);
  }
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await getClient().storage
    .from("products")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  // Private bucket — generate signed URL only after purchase
  return { url: path, name: file.name, size: file.size };
}
