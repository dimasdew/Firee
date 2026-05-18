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
import { getProduct } from "../lib/products";
import type { CartItem, Notification, Order, OrderStatus, User, WishlistItem } from "../lib/types";

const STORAGE_KEY = "firee-app-v1";

interface StoredState {
  user: User | null;
  cart: CartItem[];
  orders: Order[];
  notifications: Notification[];
  wishlist: WishlistItem[];
}

const DEFAULT_NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "Welcome to Firee", desc: "Start exploring the decentralized marketplace", time: new Date(Date.now() - 172800000).toISOString(), unread: true, type: "system" },
];


interface AppContextValue {
  user: User | null;
  cart: CartItem[];
  orders: Order[];
  notifications: Notification[];
  toast: string | null;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  isLoggedIn: boolean;
  cartCount: number;
  cartTotalEth: number;
  login: (email: string, password: string) => boolean;
  register: (email: string, password: string) => boolean;
  loginWithGoogle: (email: string, displayName?: string) => boolean;
  logout: () => void;
  connectWallet: () => void;
  disconnectWallet: () => void;
  syncWalletFromRainbow: (address: string | null) => void;
  registerWalletDisconnect: (fn: () => void) => void;
  addToCart: (productId: number, qty?: number) => void;
  updateCartQty: (productId: number, qty: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  checkout: () => Order[];
  redeemProduct: (productId: number, qty: number) => Order | null;
  markAllNotificationsRead: () => void;
  showToast: (msg: string) => void;
  unreadCount: number;
  wishlist: WishlistItem[];
  toggleWishlist: (productId: number) => void;
  isWishlisted: (productId: number) => boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

function loadState(): StoredState {
  if (typeof window === "undefined") {
    return { user: null, cart: [], orders: [], notifications: DEFAULT_NOTIFICATIONS, wishlist: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, cart: [], orders: [], notifications: DEFAULT_NOTIFICATIONS, wishlist: [] };
    return JSON.parse(raw) as StoredState;
  } catch {
    return { user: null, cart: [], orders: [], notifications: DEFAULT_NOTIFICATIONS, wishlist: [] };
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFICATIONS);
  const [toast, setToast] = useState<string | null>(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const s = loadState();
    setUser(s.user);
    setCart(s.cart);
    setOrders(s.orders ?? []);
    setNotifications(s.notifications.length ? s.notifications : DEFAULT_NOTIFICATIONS);
    setWishlist(s.wishlist ?? []);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, cart, orders, notifications, wishlist }));
  }, [hydrated, user, cart, orders, notifications, wishlist]);

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

  const scheduleOrderCompletion = useCallback(
    (orderId: string, productName: string) => {
      if (typeof window === "undefined") return;
      window.setTimeout(() => {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId && o.status !== 2 ? { ...o, status: 2 } : o))
        );
        pushNotification({
          title: "Order Completed",
          desc: `${productName} has been delivered`,
          type: "order",
        });
      }, 15000);
    },
    [pushNotification]
  );

  const createOrder = useCallback(
    (productId: number, qty: number, status: OrderStatus = 1): Order | null => {
      const product = getProduct(productId);
      if (!product) return null;
      const order: Order = {
        id: `o-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        productId,
        product: product.name,
        emoji: product.emoji,
        qty,
        priceEth: parseFloat(product.price),
        status,
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [order, ...prev]);
      pushNotification({
        title: status === 2 ? "Order Completed" : "Order Placed",
        desc: `${product.name} x${qty} — ${(parseFloat(product.price) * qty).toFixed(3)} USDC`,
        type: "order",
      });
      if (status !== 2) scheduleOrderCompletion(order.id, product.name);
      return order;
    },
    [pushNotification, scheduleOrderCompletion]
  );

  const login = useCallback((email: string, _password: string) => {
    if (!email.includes("@")) return false;
    const username = email.split("@")[0];
    setUser({
      email,
      username,
      authProvider: "email",
      walletAddress: null,
      joinedAt: new Date().toISOString(),
    });
    showToast(`Welcome back, ${username}!`);
    return true;
  }, [showToast]);

  const register = useCallback((email: string, _password: string) => {
    if (!email.includes("@")) return false;
    const username = email.split("@")[0];
    setUser({
      email,
      username,
      authProvider: "email",
      walletAddress: null,
      joinedAt: new Date().toISOString(),
    });
    pushNotification({ title: "Account Created", desc: "Your Firee account is ready", type: "system" });
    showToast("Account created successfully!");
    return true;
  }, [pushNotification, showToast]);

  const loginWithGoogle = useCallback((email: string, displayName?: string) => {
    if (!email.includes("@")) return false;
    const username = email.split("@")[0];
    const name = displayName?.trim() || username;
    setUser({
      email,
      username,
      displayName: name,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6EACDA&color=021526&size=128`,
      authProvider: "google",
      walletAddress: null,
      joinedAt: new Date().toISOString(),
    });
    pushNotification({ title: "Signed in with Google", desc: email, type: "system" });
    showToast(`Welcome, ${name}!`);
    return true;
  }, [pushNotification, showToast]);

  const logout = useCallback(() => {
    setUser(null);
    showToast("Logged out");
  }, [showToast]);

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

      if (!normalized) {
        setUser((u) => (u ? { ...u, walletAddress: null } : u));
        return;
      }

      setUser((u) => {
        if (u) return { ...u, walletAddress: normalized };
        return {
          email: `${normalized.slice(2, 10)}@wallet.firee`,
          username: `wallet_${normalized.slice(2, 8)}`,
          authProvider: "wallet",
          walletAddress: normalized,
          joinedAt: new Date().toISOString(),
        };
      });
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

  function shortenAddr(a: string) {
    return `${a.slice(0, 6)}...${a.slice(-4)}`;
  }

  const addToCart = useCallback((productId: number, qty = 1) => {
    const p = getProduct(productId);
    if (!p) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === productId);
      const currentQty = existing ? existing.qty : 0;
      if (currentQty + qty > p.stock) {
        showToast(`Only ${p.stock} in stock`);
        return prev;
      }
      if (existing) {
        return prev.map((c) => (c.productId === productId ? { ...c, qty: c.qty + qty } : c));
      }
      return [...prev, { productId, qty }];
    });
    showToast(`${p.name} added to cart`);
  }, [showToast]);

  const updateCartQty = useCallback((productId: number, qty: number) => {
    if (qty < 1) {
      setCart((prev) => prev.filter((c) => c.productId !== productId));
      return;
    }
    const p = getProduct(productId);
    if (p && qty > p.stock) {
      showToast(`Only ${p.stock} in stock`);
      return;
    }
    setCart((prev) => prev.map((c) => (c.productId === productId ? { ...c, qty } : c)));
  }, [showToast]);

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
    showToast("Removed from cart");
  }, [showToast]);

  const clearCart = useCallback(() => setCart([]), []);

  const checkout = useCallback(() => {
    const created: Order[] = [];
    cart.forEach((item) => {
      const o = createOrder(item.productId, item.qty, 1);
      if (o) created.push(o);
    });
    clearCart();
    if (created.length) showToast(`${created.length} order(s) placed!`);
    return created;
  }, [cart, clearCart, createOrder, showToast]);

  const redeemProduct = useCallback(
    (productId: number, qty: number) => {
      const order = createOrder(productId, qty, 1);
      if (order) showToast("Product redeemed successfully!");
      return order;
    },
    [createOrder, showToast]
  );

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const toggleWishlist = useCallback((productId: number) => {
    setWishlist((prev) => {
      const exists = prev.find((w) => w.productId === productId);
      if (exists) {
        showToast("Removed from wishlist");
        return prev.filter((w) => w.productId !== productId);
      }
      const p = getProduct(productId);
      showToast(p ? `${p.name} added to wishlist` : "Added to wishlist");
      return [...prev, { productId, addedAt: new Date().toISOString() }];
    });
  }, [showToast]);

  const isWishlisted = useCallback((productId: number) => {
    return wishlist.some((w) => w.productId === productId);
  }, [wishlist]);

  const cartCount = useMemo(() => cart.reduce((s, c) => s + c.qty, 0), [cart]);

  const cartTotalEth = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const p = getProduct(item.productId);
        return sum + (p ? parseFloat(p.price) * item.qty : 0);
      }, 0),
    [cart]
  );

  const unreadCount = useMemo(() => notifications.filter((n) => n.unread).length, [notifications]);

  const value: AppContextValue = {
    user,
    cart,
    orders,
    notifications,
    toast,
    cartDrawerOpen,
    setCartDrawerOpen,
    isLoggedIn: !!user,
    cartCount,
    cartTotalEth,
    login,
    register,
    loginWithGoogle,
    logout,
    connectWallet,
    disconnectWallet,
    syncWalletFromRainbow,
    registerWalletDisconnect,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    checkout,
    redeemProduct,
    markAllNotificationsRead,
    showToast,
    unreadCount,
    wishlist,
    toggleWishlist,
    isWishlisted,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
