// Database types matching Supabase schema

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  wallet_address: string | null;
  is_seller: boolean;
  seller_verified: boolean;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  created_at: string;
}

export interface DbProduct {
  id: string;
  seller_id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string | null;
  price_usdc: number;
  category_id: number | null;
  thumbnail_url: string | null;
  preview_images: string[];
  file_url: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  tags: string[];
  is_published: boolean;
  is_featured: boolean;
  total_sales: number;
  total_revenue_usdc: number;
  created_at: string;
  updated_at: string;
  // Joined fields (optional)
  seller?: Profile;
  category?: Category;
}

export type OrderStatus = "pending" | "paid" | "completed" | "refunded" | "disputed";

export interface DbOrder {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  price_usdc: number;
  platform_fee_usdc: number;
  seller_revenue_usdc: number;
  tx_hash: string | null;
  status: OrderStatus;
  download_url: string | null;
  downloaded_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  product?: DbProduct;
  buyer?: Profile;
  seller?: Profile;
}

export interface Review {
  id: string;
  order_id: string;
  buyer_id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  buyer?: Profile;
}

export type PayoutStatus = "pending" | "processing" | "completed" | "failed";

export interface Payout {
  id: string;
  seller_id: string;
  amount_usdc: number;
  wallet_address: string;
  tx_hash: string | null;
  status: PayoutStatus;
  created_at: string;
}
