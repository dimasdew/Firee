import { createClient } from "./client";
import type { Profile } from "./types";

function getClient() { return createClient(); }

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

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  const { data, error } = await getClient()
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function becomeSeller(userId: string): Promise<Profile> {
  return updateProfile(userId, { is_seller: true });
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return getClient().auth.onAuthStateChange(callback);
}
