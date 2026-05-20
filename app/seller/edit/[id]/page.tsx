"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Upload, Image, FileText, DollarSign, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useApp } from "../../../../context/AppContext";
import { getCategories, updateProduct, uploadThumbnail, uploadProductFile } from "../../../../lib/supabase/products";
import { createClient } from "../../../../lib/supabase/client";
import type { Category, DbProduct } from "../../../../lib/supabase/types";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    shortDescription: "",
    price: "",
    categoryId: 0,
    tags: "",
    isPublished: false,
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [cats] = await Promise.all([getCategories()]);
        setCategories(cats);

        const supabase = createClient();
        const { data, error } = await supabase
          .from("products")
          .select("*, category:categories(*)")
          .eq("id", id)
          .single();
        if (error || !data) { showToast("Product not found"); router.push("/seller"); return; }

        setProduct(data);
        setForm({
          title: data.title,
          description: data.description,
          shortDescription: data.short_description || "",
          price: String(data.price_usdc),
          categoryId: data.category_id || cats[0]?.id || 0,
          tags: (data.tags || []).join(", "),
          isPublished: data.is_published,
        });
      } catch (err) {
        console.error(err);
        showToast("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, router, showToast]);

  const update = (field: string, value: string | boolean) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price) {
      showToast("Please fill in all required fields");
      return;
    }
    setSaving(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { showToast("Please login"); setSaving(false); return; }

      const updates: Record<string, any> = {
        title: form.title,
        description: form.description,
        short_description: form.shortDescription || null,
        price_usdc: parseFloat(form.price),
        category_id: form.categoryId,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        is_published: form.isPublished,
      };

      if (thumbnail) {
        updates.thumbnail_url = await uploadThumbnail(user.id, thumbnail);
      }
      if (productFile) {
        const fileData = await uploadProductFile(user.id, productFile);
        updates.file_url = fileData.url;
        updates.file_name = fileData.name;
        updates.file_size_bytes = fileData.size;
      }

      await updateProduct(id, updates);
      showToast("Product updated!");
      router.push("/seller");
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "64px 0" }}>
        <Loader2 size={24} color="var(--sky)" style={{ margin: "0 auto", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div>
      <Link href="/seller" className="back-link" style={{ marginBottom: 20, display: "inline-flex" }}>
        <ArrowLeft size={14} /> Back to Products
      </Link>

      <form onSubmit={handleSubmit}>
        <div className="seller-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
          {/* Main form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)", marginBottom: 16 }}>
                Edit Product
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="label">Title *</label>
                  <input className="input" required value={form.title} onChange={(e) => update("title", e.target.value)} />
                </div>
                <div>
                  <label className="label">Short Description</label>
                  <input className="input" value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} maxLength={120} />
                </div>
                <div>
                  <label className="label">Description *</label>
                  <textarea className="input" rows={6} required value={form.description} onChange={(e) => update("description", e.target.value)} style={{ resize: "vertical" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="label">Category</label>
                    <select className="input" value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: Number(e.target.value) }))}>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Tags</label>
                    <input className="input" placeholder="react, tailwind, nextjs" value={form.tags} onChange={(e) => update("tags", e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)", marginBottom: 16 }}>
                <FileText size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />
                Product File
              </h3>
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                padding: "24px 20px", borderRadius: 10,
                border: "2px dashed var(--border)", cursor: "pointer",
                background: productFile ? "rgba(110,172,218,0.04)" : "transparent",
              }}>
                <Upload size={24} color="var(--sky)" style={{ opacity: 0.6 }} />
                {productFile ? (
                  <>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text, white)" }}>{productFile.name}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{(productFile.size / 1024 / 1024).toFixed(1)} MB</p>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      {product.file_name ? `Current: ${product.file_name}` : "Click to upload"}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", opacity: 0.6 }}>Upload new file to replace</p>
                  </>
                )}
                <input type="file" accept=".zip,.rar,.pdf,.fig,.sketch" style={{ display: "none" }} onChange={(e) => setProductFile(e.target.files?.[0] ?? null)} />
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
                <input className="input" type="number" step="0.01" min="0" required value={form.price} onChange={(e) => update("price", e.target.value)} style={{ fontSize: 18, fontWeight: 700 }} />
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
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                padding: "24px 16px", borderRadius: 10,
                border: "2px dashed var(--border)", cursor: "pointer",
                aspectRatio: "16/9", justifyContent: "center", overflow: "hidden",
              }}>
                {thumbnail ? (
                  <img src={URL.createObjectURL(thumbnail)} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
                ) : product.thumbnail_url ? (
                  <img src={product.thumbnail_url} alt="Current" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
                ) : (
                  <>
                    <Image size={20} color="var(--sky)" style={{ opacity: 0.5 }} />
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Upload cover image</p>
                  </>
                )}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)} />
              </label>
            </div>

            {/* Publish toggle */}
            <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {form.isPublished ? <Eye size={14} color="#4ade80" /> : <EyeOff size={14} color="var(--text-muted)" />}
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text, white)" }}>
                  {form.isPublished ? "Published" : "Draft"}
                </span>
              </div>
              <button type="button" className={`btn-ghost`} style={{ fontSize: 11, padding: "6px 12px" }}
                onClick={() => update("isPublished", !form.isPublished)}>
                {form.isPublished ? "Unpublish" : "Publish"}
              </button>
            </div>

            {/* Save */}
            <button type="submit" className="btn-sand" disabled={saving}
              style={{ width: "100%", justifyContent: "center", padding: "12px 20px" }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
