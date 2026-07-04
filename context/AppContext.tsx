"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Notification, User } from "../lib/types";
import { createClient } from "../lib/supabase/client";

const STORAGE_KEY = "firee-app-v1";

interface StoredState {
  user: User | null;
  notifications: Notification[];
}

const DEFAULT_NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "Welcome to Firee", desc: "Start exploring the decentralized marketplace", time: new Date(Date.now() - 172800000).toISOString(), unread: true, type: "system" },
];


interface AppContextValue {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  notifications: Notification[];
  toast: string | null;
  isLoggedIn: boolean;
  needsPassword: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  setUserPassword: (password: string) => Promise<boolean>;
  connectWallet: () => void;
  disconnectWallet: () => void;
  syncWalletFromRainbow: (address: string | null) => void;
  registerWalletDisconnect: (fn: () => void) => void;
  markAllNotificationsRead: () => void;
  showToast: (msg: string) => void;
  unreadCount: number;
  marketplaceWishlist: string[];
  toggleMarketplaceWishlist: (productId: string) => void;
  isMarketplaceWishlisted: (productId: string) => boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

function loadState(): StoredState {
  if (typeof window === "undefined") {
    return { user: null, notifications: DEFAULT_NOTIFICATIONS };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, notifications: DEFAULT_NOTIFICATIONS };
    return JSON.parse(raw) as StoredState;
  } catch {
    return { user: null, notifications: DEFAULT_NOTIFICATIONS };
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  // C7: track whether Supabase session is active — wallet-only connection must NOT set this true
  const [hasSupabaseSession, setHasSupabaseSession] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFICATIONS);
  const [toast, setToast] = useState<string | null>(null);
  const [marketplaceWishlist, setMarketplaceWishlist] = useState<string[]>([]);

  useEffect(() => {
    const s = loadState();
    setUser(s.user);
    setNotifications(s.notifications?.length ? s.notifications : DEFAULT_NOTIFICATIONS);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, notifications }));
  }, [hydrated, user, notifications]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  const pushNotification = useCallback((n: Omit<Notification, "id" | "time" | "unread">) => {
    const item: Notification = {
      ...n,
      id: `n-${Date.now()}`,
      time: new Date().toISOString(),
      unread: true,
    };
    setNotifications((prev) => [item, ...prev].slice(0, 20));
  }, []);

  const supabase = useMemo(() => createClient(), []);

  const checkNeedsPassword = useCallback((su: any) => {
    const identities = su.identities as Array<{ provider: string }> | undefined;
    const hasEmail = identities?.some((i) => i.provider === "email") ?? false;
    const isGoogle = su.app_metadata?.provider === "google";
    const needs = isGoogle && !hasEmail;
    setNeedsPassword(needs);
    if (needs) localStorage.setItem("firee-needs-password", "true");
    else localStorage.removeItem("firee-needs-password");
    return needs;
  }, []);

  // Listen for Supabase auth state changes
  useEffect(() => {
    async function hydrateUser(su: any) {
      const email = su.email || "";
      const fallbackUsername = email.split("@")[0] || `user_${su.id.slice(0, 8)}`;
      const provider = su.app_metadata?.provider;
      // Fetch saved profile from DB (non-blocking — login works even if this fails)
      let profile: any = null;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", su.id)
          .single();
        if (error) console.warn("[Firee] Profile fetch:", error.message);
        profile = data;
      } catch (e) {
        console.warn("[Firee] Profile fetch failed:", e);
      }
      setUser({
        id: su.id,
        email: profile?.email || email,
        username: profile?.username || fallbackUsername,
        displayName: profile?.display_name || su.user_metadata?.full_name || fallbackUsername,
        avatarUrl: profile?.avatar_url || su.user_metadata?.avatar_url || undefined,
        authProvider: provider === "google" ? "google" : "email",
        walletAddress: profile?.wallet_address || null,
        joinedAt: su.created_at,
        isAdmin: profile?.is_admin || false,
      });
      checkNeedsPassword(su);
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await hydrateUser(session.user);
        setHasSupabaseSession(true);
      } else {
        setUser(null);
        setHasSupabaseSession(false);
        setNeedsPassword(false);
        localStorage.removeItem("firee-needs-password");
      }
    });
    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        hydrateUser(session.user);
        setHasSupabaseSession(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, checkNeedsPassword]);

  // Redirect Google OAuth users to set-password if needed
  useEffect(() => {
    if (!hydrated) return;
    const stored = localStorage.getItem("firee-needs-password");
    if ((needsPassword || stored === "true") && pathname !== "/set-password") {
      router.push("/set-password");
    }
  }, [hydrated, needsPassword, pathname, router]);

  // Realtime notifications for new orders (seller) and new reviews (buyer)
  useEffect(() => {
    if (!user) return;
    const uid = user.id;
    const channel = supabase
      .channel("firee-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload: any) => {
          const row = payload.new;
          if (row.seller_id === uid) {
            pushNotification({
              title: "New Sale!",
              desc: `You earned ${Number(row.seller_revenue_usdc).toFixed(2)} USDC`,
              type: "order",
            });
            showToast("🎉 New sale received!");
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reviews" },
        (payload: any) => {
          const row = payload.new;
          if (row.buyer_id === uid) return; // don't notify self
          // Notify seller: look up product to check ownership
          supabase
            .from("products")
            .select("seller_id, title")
            .eq("id", row.product_id)
            .single()
            .then(({ data: product }) => {
              if (product && product.seller_id === uid) {
                pushNotification({
                  title: "New Review!",
                  desc: `Someone reviewed "${product.title}" — ${row.rating}★`,
                  type: "system",
                });
                showToast(`⭐ New ${row.rating}-star review!`);
              }
            });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, supabase, pushNotification, showToast]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { showToast(error.message); return false; }
      showToast(`Welcome back!`);
      return true;
    } catch {
      showToast("Login failed");
      return false;
    }
  }, [supabase, showToast]);

  const register = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: email.split("@")[0] } },
      });
      if (error) { showToast(error.message); return false; }
      pushNotification({ title: "Account Created", desc: "Your Firee account is ready", type: "system" });
      showToast("Account created! Check your email to confirm.");
      return true;
    } catch {
      showToast("Registration failed");
      return false;
    }
  }, [supabase, pushNotification, showToast]);

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) { showToast(error.message); return false; }
      return true;
    } catch {
      showToast("Google sign-in failed");
      return false;
    }
  }, [supabase, showToast]);

  const setUserPassword = useCallback(async (password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) { showToast(error.message); return false; }
      setNeedsPassword(false);
      localStorage.removeItem("firee-needs-password");
      showToast("Password set successfully!");
      return true;
    } catch {
      showToast("Failed to set password");
      return false;
    }
  }, [supabase, showToast]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setHasSupabaseSession(false);
    setNeedsPassword(false);
    localStorage.removeItem("firee-needs-password");
    showToast("Logged out");
  }, [supabase, showToast]);

  const walletDisconnectRef = useRef<(() => void) | null>(null);
  const lastSyncedWallet = useRef<string | null>(null);

  const registerWalletDisconnect = useCallback((fn: () => void) => {
    walletDisconnectRef.current = fn;
  }, []);

  const syncWalletFromRainbow = useCallback(
    (address: string | null) => {
      const normalized = address?.toLowerCase() ?? null;
      if (normalized === lastSyncedWallet.current) return;
      lastSyncedWallet.current = normalized;

      // C7: only update walletAddress on an EXISTING Supabase-authenticated user.
      // Never create a phantom user from wallet connection alone — that bypasses AuthGuard.
      if (!normalized) {
        setUser((u) => (u ? { ...u, walletAddress: null } : u));
        return;
      }
      setUser((u) => (u ? { ...u, walletAddress: normalized } : u));
    },
    []
  );

  /** @deprecated Use FireeConnectButton (RainbowKit) */
  const connectWallet = useCallback(() => {}, []);

  const disconnectWallet = useCallback(() => {
    walletDisconnectRef.current?.();
    lastSyncedWallet.current = null;
    setUser((u) => (u ? { ...u, walletAddress: null } : u));
    showToast("Wallet disconnected");
  }, [showToast]);


  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  // Marketplace wishlist (Supabase-synced)
  useEffect(() => {
    if (!user) { setMarketplaceWishlist([]); return; }
    supabase
      .from("wishlists")
      .select("product_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setMarketplaceWishlist(data.map((d: any) => d.product_id));
      });
  }, [user, supabase]);

  const toggleMarketplaceWishlist = useCallback(async (productId: string) => {
    if (!user) { showToast("Please login first"); return; }
    const exists = marketplaceWishlist.includes(productId);
    if (exists) {
      setMarketplaceWishlist((prev) => prev.filter((id) => id !== productId));
      showToast("Removed from wishlist");
      await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId);
    } else {
      setMarketplaceWishlist((prev) => [...prev, productId]);
      showToast("Added to wishlist");
      await supabase.from("wishlists").insert({ user_id: user.id, product_id: productId });
    }
  }, [user, marketplaceWishlist, supabase, showToast]);

  const isMarketplaceWishlisted = useCallback((productId: string) => {
    return marketplaceWishlist.includes(productId);
  }, [marketplaceWishlist]);

  const unreadCount = useMemo(() => notifications.filter((n) => n.unread).length, [notifications]);

  const value: AppContextValue = {
    user,
    setUser,
    notifications,
    toast,
    isLoggedIn: hasSupabaseSession && !!user,
    needsPassword,
    login,
    register,
    loginWithGoogle,
    logout,
    setUserPassword,
    connectWallet,
    disconnectWallet,
    syncWalletFromRainbow,
    registerWalletDisconnect,
    markAllNotificationsRead,
    showToast,
    unreadCount,
    marketplaceWishlist,
    toggleMarketplaceWishlist,
    isMarketplaceWishlisted,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
