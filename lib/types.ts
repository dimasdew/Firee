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
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  authProvider: AuthProvider;
  walletAddress: string | null;
  joinedAt: string;
  isAdmin?: boolean;
}
