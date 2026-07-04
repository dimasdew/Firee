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

/** Fetch only distinct tags — avoids loading the full products table just for tag extraction */
export async function getDistinctTags(): Promise<string[]> {
  const { data, error } = await getClient().rpc("get_distinct_tags");
  if (error) {
    // Fallback: fetch titles+tags only (much lighter than full row)
    const { data: d2 } = await getClient()
      .from("products")
      .select("tags")
      .eq("is_published", true);
    if (!d2) return [];
    const set = new Set<string>();
    d2.forEach((p: any) => (p.tags ?? []).forEach((t: string) => set.add(t)));
    return Array.from(set).sort();
  }
  return (data as string[]) ?? [];
}

export async function getPublishedProducts(): Promise<DbProduct[]> {
  const { data, error } = await getClient()
    .from("products")
    .select("*, seller:profiles(id, username, display_name, avatar_url), category:categories(*)")
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

  // Select safe public seller fields only (no email / wallet_address)
  let query = getClient()
    .from("products")
    .select("*, seller:profiles(id, username, display_name, avatar_url), category:categories(*)", { count: "exact" })
    .eq("is_published", true);

  if (search.trim()) {
    // Sanitize: escape PostgREST filter special chars to prevent injection
    const term = search.trim().toLowerCase()
      .replace(/[,%()]/g, ""); // strip , ( ) % which alter filter semantics
    if (term) {
      query = query.or(
        `title.ilike.%${term}%,description.ilike.%${term}%,short_description.ilike.%${term}%`
      );
    }
  }

  if (category && category !== "All") {
    const { data: cat } = await getClient()
      .from("categories")
      .select("id")
      .eq("name", category)
      .single();
    if (cat) {
      query = query.eq("category_id", cat.id);
    }
    // If category not found, skip filter (don't silently return everything)
  }

  if (tag) {
    query = query.contains("tags", [tag]);
  }

  if (priceMin !== undefined && priceMin > 0) {
    query = query.gte("price_usdc", priceMin);
  }
  if (priceMax !== undefined && priceMax < Infinity) {
    query = query.lte("price_usdc", priceMax);
  }

  if (sort === "price-asc") query = query.order("price_usdc", { ascending: true });
  else if (sort === "price-desc") query = query.order("price_usdc", { ascending: false });
  else if (sort === "name") query = query.order("title", { ascending: true });
  else query = query.order("created_at", { ascending: false });

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    products: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getProductById(id: string): Promise<DbProduct | null> {
  const { data, error } = await getClient()
    .from("products")
    .select("*, seller:profiles(id, username, display_name, avatar_url), category:categories(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function getProductBySlug(sellerSlug: string, slug: string): Promise<DbProduct | null> {
  // Must filter by both slug AND seller slug (unique per-seller, not globally)
  const { data: seller } = await getClient()
    .from("profiles")
    .select("id")
    .eq("username", sellerSlug)
    .single();
  if (!seller) return null;

  const { data, error } = await getClient()
    .from("products")
    .select("*, seller:profiles(id, username, display_name, avatar_url), category:categories(*)")
    .eq("slug", slug)
    .eq("seller_id", seller.id)
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
    .select("*, seller:profiles(id, username, display_name, avatar_url), category:categories(*)")
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

// Whitelisted seller-editable fields only. is_featured / total_sales / total_revenue_usdc
// are admin/system fields — never let the client set them.
type SellerProductUpdate = Pick<
  DbProduct,
  "title" | "slug" | "description" | "short_description" | "price_usdc"
  | "category_id" | "thumbnail_url" | "file_url" | "file_name" | "file_size_bytes"
  | "tags" | "is_published"
>;

export async function updateProduct(
  id: string,
  updates: Partial<SellerProductUpdate>
): Promise<DbProduct> {
  // Strip privileged fields
  const { is_featured, total_sales, total_revenue_usdc, seller_id, ...safe } = updates as any;
  void is_featured; void total_sales; void total_revenue_usdc; void seller_id;

  const { data, error } = await getClient()
    .from("products")
    .update(safe)
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

// SVG removed — stored XSS risk via public thumbnail bucket
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;
const MAX_PRODUCT_FILE_SIZE = 50 * 1024 * 1024;

export async function uploadThumbnail(userId: string, file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`Invalid image type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF.`);
  }
  if (file.size > MAX_THUMBNAIL_SIZE) {
    throw new Error(`Thumbnail too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 5MB.`);
  }
  // Use random filename to avoid path traversal / guessable paths
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await getClient().storage
    .from("thumbnails")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = getClient().storage.from("thumbnails").getPublicUrl(path);
  return data.publicUrl;
}

const ALLOWED_EXTENSIONS = [
  "pdf", "zip", "rar", "7z", "tar", "gz",
  "mp4", "mp3", "wav", "flac",
  "jpg", "jpeg", "png", "webp", "gif",
  "ttf", "otf", "woff", "woff2",
  "epub", "mobi",
  "psd", "ai", "fig", "sketch",
  "csv", "json", "xml",
];

export async function uploadProductFile(
  userId: string,
  file: File
): Promise<{ url: string; name: string; size: number }> {
  if (file.size > MAX_PRODUCT_FILE_SIZE) {
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 50MB.`);
  }
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`File type .${ext} is not allowed.`);
  }
  // Random filename prevents guessing private paths
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await getClient().storage
    .from("products")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  return { url: path, name: file.name, size: file.size };
}
