import { createClient } from "./client";
import type { Profile } from "./types";

function getClient() { return createClient(); }

// Safe profile fields a user can update themselves — never includes is_admin/is_banned/seller_verified
type SafeProfileUpdate = Pick<
  Profile,
  "username" | "display_name" | "avatar_url" | "bio" | "website" | "twitter" | "wallet_address"
>;

export async function signUp(email: string, password: string, displayName?: string) {
  const { data, error } = await getClient().auth.signUp({
    email,
    password,
    options: {
      data: { full_name: displayName || email.split("@")[0] },
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await getClient().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await getClient().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/dashboard` },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await getClient().auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await getClient().auth.getUser();
  return user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await getClient()
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data;
}

/**
 * Update safe profile fields only.
 * is_admin / is_banned / seller_verified / is_seller are stripped — those require server-side admin RPCs.
 */
export async function updateProfile(userId: string, updates: Partial<SafeProfileUpdate>): Promise<Profile> {
  // Strip any privileged fields the caller might accidentally pass
  const { is_admin, is_banned, seller_verified, is_seller, ...safe } = updates as any;
  void is_admin; void is_banned; void seller_verified; void is_seller;

  const { data, error } = await getClient()
    .from("profiles")
    .update(safe)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Request seller status — server-side RLS + admin approval required */
export async function becomeSeller(userId: string): Promise<Profile> {
  // Only sets is_seller=true; seller_verified stays false until admin approves
  const { data, error } = await getClient()
    .from("profiles")
    .update({ is_seller: true })
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return getClient().auth.onAuthStateChange(callback);
}
