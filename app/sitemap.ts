import type { MetadataRoute } from "next";
import { createClient } from "../lib/supabase/client";

const BASE_URL = "https://mp-firee.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/dashboard`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/create`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/support`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  // Dynamic product pages
  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, updated_at")
    .eq("is_published", true);

  const productPages: MetadataRoute.Sitemap = (products ?? []).map((p: any) => ({
    url: `${BASE_URL}/product/${p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic shop pages
  const { data: sellers } = await supabase
    .from("profiles")
    .select("id, updated_at")
    .eq("is_seller", true)
    .eq("seller_verified", true);

  const shopPages: MetadataRoute.Sitemap = (sellers ?? []).map((s: any) => ({
    url: `${BASE_URL}/shop/${s.id}`,
    lastModified: new Date(s.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...shopPages];
}
