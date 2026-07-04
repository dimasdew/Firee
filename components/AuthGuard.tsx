"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";

/**
 * H10: Hydration gate — don't flash-redirect on first render before Supabase
 * session is resolved. Wait for `hydrated` before acting on isLoggedIn.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useApp();
  const router = useRouter();
  // Wait one tick for Supabase onAuthStateChange to resolve before redirecting
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !isLoggedIn) router.replace("/login");
  }, [ready, isLoggedIn, router]);

  // Still checking — render nothing (no flash)
  if (!ready || !isLoggedIn) return null;
  return <>{children}</>;
}
