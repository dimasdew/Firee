"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, Image, FileText, Tag, DollarSign, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useApp } from "../../../context/AppContext";
import { createProduct, uploadThumbnail, uploadProductFile, getCategories } from "../../../lib/supabase/products";
import { createClient } from "../../../lib/supabase/client";
import type { Category } from "../../../lib/supabase/types";

export default function NewProductPage() {
  const router = useRouter();
  const { showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    shortDescription: "",
    price: "",
    categoryId: 0,
    tags: "",
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);

  useEffect(() => {
    getCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0) setForm((f) => ({ ...f, categoryId: cats[0].id }));
    });
  }, []);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSubmit = async (e: React.FormEvent, publish: boolean) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price) {
      showToast("Please fill in all required fields");
      return;
    }
    if (!productFile) {
      showToast("Please upload a product file");
      return;
    }
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { showToast("Please login first"); setLoading(false); return; }

      // Upload files
      let thumbnailUrl: string | undefined;
      if (thumbnail) {
        thumbnailUrl = await uploadThumbnail(user.id, thumbnail);
      }
      const fileData = await uploadProductFile(user.id, productFile);

      // Create product
      await createProduct({
        seller_id: user.id,
        title: form.title,
        slug: slugify(form.title),
        description: form.description,
        short_description: form.shortDescription || undefined,
        price_usdc: parseFloat(form.price),
        category_id: form.categoryId,
        thumbnail_url: thumbnailUrl,
        file_url: fileData.url,
        file_name: fileData.name,
        file_size_bytes: fileData.size,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        is_published: publish,
      });

      showToast(publish ? "Product published!" : "Draft saved!");
      router.push("/seller");
    } catch (err: any) {
      console.error("Create product error:", err);
      showToast(err?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link href="/seller" className="back-link" style={{ marginBottom: 20, display: "inline-flex" }}>
        <ArrowLeft size={14} /> Back to Products
      </Link>

      <form onSubmit={(e) => handleSubmit(e, true)}>
        <div className="seller-form-grid" style={{ gap: 20, alignItems: "start" }}>
          {/* Main form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Basic Info */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)", marginBottom: 16 }}>
                Product Information
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="label">Title *</label>
                  <input
                    className="input"
                    placeholder="e.g. Starter UI Kit"
                    required
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Short Description</label>
                  <input
                    className="input"
                    placeholder="One-line summary for product cards"
                    value={form.shortDescription}
                    onChange={(e) => update("shortDescription", e.target.value)}
                    maxLength={120}
                  />
                </div>
                <div>
                  <label className="label">Description *</label>
                  <textarea
                    className="input"
                    rows={6}
                    placeholder="Describe what's included, who it's for, and why it's valuable..."
                    required
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    style={{ resize: "vertical" }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                  <div>
                    <label className="label">Category</label>
                    <select
                      className="input"
                      value={form.categoryId}
                      onChange={(e) => setForm((f) => ({ ...f, categoryId: Number(e.target.value) }))}
                    >
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Tags</label>
                    <input
                      className="input"
                      placeholder="react, tailwind, nextjs"
                      value={form.tags}
                      onChange={(e) => update("tags", e.target.value)}
                    />
                    <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>Comma-separated</p>
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)", marginBottom: 16 }}>
                <FileText size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />
                Product File *
              </h3>
              <label
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  padding: "32px 20px", borderRadius: 10,
                  border: "2px dashed var(--border)", cursor: "pointer",
                  background: productFile ? "rgba(110,172,218,0.04)" : "transparent",
                  transition: "border-color 0.2s",
                }}
              >
                <Upload size={24} color="var(--sky)" style={{ opacity: 0.6 }} />
                {productFile ? (
                  <>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text, white)" }}>{productFile.name}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {(productFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Click to upload product file</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", opacity: 0.6 }}>ZIP, RAR, PDF up to 100MB</p>
                  </>
                )}
                <input
                  type="file"
                  accept=".zip,.rar,.pdf,.fig,.sketch"
                  style={{ display: "none" }}
                  onChange={(e) => setProductFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Price */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)", marginBottom: 16 }}>
                <DollarSign size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />
                Pricing
              </h3>
              <div>
                <label className="label">Price (USDC) *</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="19.00"
                  required
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  style={{ fontSize: 18, fontWeight: 700 }}
                />
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                  Platform fee: 3% · You receive: {form.price ? (parseFloat(form.price) * 0.97).toFixed(2) : "0.00"} USDC
                </p>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)", marginBottom: 16 }}>
                <Image size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />
                Thumbnail
              </h3>
              <label
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  padding: "24px 16px", borderRadius: 10,
                  border: "2px dashed var(--border)", cursor: "pointer",
                  aspectRatio: "16/9", justifyContent: "center",
                  background: thumbnail ? "rgba(110,172,218,0.04)" : "transparent",
                  overflow: "hidden",
                }}
              >
                {thumbnail ? (
                  <img
                    src={URL.createObjectURL(thumbnail)}
                    alt="Thumbnail preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }}
                  />
                ) : (
                  <>
                    <Image size={20} color="var(--sky)" style={{ opacity: 0.5 }} />
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Upload cover image</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                type="submit"
                className="btn-sand"
                disabled={loading}
                style={{ width: "100%", justifyContent: "center", padding: "12px 20px" }}
              >
                {loading ? "Publishing..." : "Publish Product"}
              </button>
              <button
                type="button"
                className="btn-ghost"
                disabled={loading}
                onClick={(e) => handleSubmit(e as unknown as React.FormEvent, false)}
                style={{ width: "100%", justifyContent: "center", padding: "12px 20px" }}
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
