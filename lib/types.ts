export type ProductCategory = "Beverage" | "Electronics" | "Fashion" | "Food" | "All";

export interface Product {
  id: number;
  name: string;
  price: string;
  category: Exclude<ProductCategory, "All">;
  emoji: string;
  company: string;
  tagline: string;
  description: string;
  description2: string;
  benefits: string[];
  stock: number;
}

export type OrderStatus = 0 | 1 | 2; // Redeemed | Delivering | Completed

export interface Order {
  id: string;
  productId: number;
  product: string;
  emoji: string;
  qty: number;
  priceEth: number;
  status: OrderStatus;
  createdAt: string;
}

export interface CartItem {
  productId: number;
  qty: number;
}

export interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  type: "order" | "system" | "wallet";
}

export type AuthProvider = "email" | "google" | "wallet";

export interface User {
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  authProvider: AuthProvider;
  walletAddress: string | null;
  joinedAt: string;
}
