"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../../../components/Navbar";
import MobileBottomNav from "../../../components/MobileBottomNav";
import PurchaseModal from "../../../components/PurchaseModal";
import ReviewSection from "../../../components/ReviewSection";
import UsdcAmount from "../../../components/UsdcAmount";
import { useApp } from "../../../context/AppContext";
import { getProductById } from "../../../lib/supabase/products";
import { getDownloadUrl } from "../../../lib/supabase/orders";
import { createClient } from "../../../lib/supabase/client";
import type { DbProduct } from "../../../lib/supabase/types";
import { ArrowLeft, ShoppingBag, CheckCircle, Share2, Wallet, Download, Loader2, User, Flag } from "lucide-react";
import { reportProduct, hasReported, type ReportReason } from "../../../lib/supabase/reports";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useApp();
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPurchase, setShowPurchase] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>("copyright");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const productId = params.id as string;

  useEffect(() => {
    if (!productId) return;
    getProductById(productId)
      .then((p) => {
        if (!p) { router.push("/dashboard"); return; }
        setProduct(p);
      })
      .catch(() => router.push("/dashboard"))
      .finally(() => setLoading(false));
  }, [productId, router]);

  // Check if buyer already purchased + already reported
  useEffect(() => {
    if (!product) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("orders")
        .select("id")
        .eq("buyer_id", user.id)
        .eq("product_id", product.id)
        .eq("status", "completed")
        .limit(1)
        .then(({ data }) => {
          if (data && data.length > 0) setPurchased(true);
        });
      hasReported(product.id, user.id).then(setAlreadyReported);
    });
  }, [product]);

  const handleReport = async () => {
    setReportSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { showToast("Please login first"); return; }
      await reportProduct(productId, user.id, reportReason, reportDetails);
      setAlreadyReported(true);
      setShowReport(false);
      setReportDetails("");
      showToast("Report submitted. We'll review it shortly.");
    } catch {
      showToast("Failed to submit report");
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: product?.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      showToast("Link copied!");
    }
  };

  const handleDownload = async () => {
    if (!product) return;
    setDownloading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { showToast("Please log in"); return; }
      const url = await getDownloadUrl(user.id, product.id);
      if (url) {
        setDownloadLink(url);
        window.open(url, "_blank");
      } else {
        showToast("Download not available");
      }
    } catch {
      showToast("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const handlePurchaseSuccess = (txHash: string) => {
    setPurchased(true);
    showToast("Purchase complete! You can now download the file.");
  };

  if (loading) {
    return (
      <div className="page-shell">
        <Navbar variant="dashboard" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "var(--sky)" }} />
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="page-shell">
      <Navbar variant="dashboard" />
      <main className="container" style={{ padding: "28px 0 48px" }}>
        <Link href="/dashboard" className="back-link">
          <ArrowLeft size={14} /> Back to Marketplace
        </Link>

        <div className="detail-grid">
          {/* Left — Product visual */}
          <div>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {product.total_sales} sold
                </span>
                <button type="button" onClick={handleShare} className="icon-btn" style={{ marginLeft: "auto" }} aria-label="Share">
                  <Share2 size={13} />
                </button>
                <span className="badge badge-green" style={{ fontSize: 9 }}>Live</span>
              </div>
              <div style={{ padding: "32px 24px", textAlign: "center" }}>
                <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 20, color: "var(--text, white)" }}>{product.title}</p>
                {(() => {
                  const allImages = [
                    ...(product.thumbnail_url ? [product.thumbnail_url] : []),
                    ...(product.preview_images || []),
                  ];
                  const currentImg = allImages[selectedImage] || null;
                  return (
                    <>
                      <div style={{
                        position: "relative", width: "100%", maxWidth: 320, aspectRatio: "1", margin: "0 auto 16px", borderRadius: 12,
                        background: "rgba(110,172,218,0.05)", border: "1px solid var(--border)",
                        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                      }}>
                        {currentImg
                          ? <Image src={currentImg} alt={product.title} fill sizes="320px" style={{ objectFit: "cover" }} />
                          : <ShoppingBag size={40} color="var(--sky)" style={{ opacity: 0.2 }} />
                        }
                      </div>
                      {allImages.length > 1 && (
                        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
                          {allImages.map((img, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setSelectedImage(i)}
                              style={{
                                position: "relative", width: 48, height: 48, borderRadius: 8, overflow: "hidden", padding: 0,
                                border: selectedImage === i ? "2px solid var(--sky)" : "1px solid var(--border)",
                                background: "rgba(110,172,218,0.05)", cursor: "pointer",
                                opacity: selectedImage === i ? 1 : 0.6,
                              }}
                            >
                              <Image src={img} alt={`Preview ${i + 1}`} fill sizes="48px" style={{ objectFit: "cover" }} />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "rgba(226,226,182,0.06)", border: "1px solid rgba(226,226,182,0.15)", marginBottom: 20 }}>
                  <UsdcAmount value={product.price_usdc} showLabel={false} iconSize={16} style={{ fontSize: 18, fontWeight: 700, color: "var(--sand)" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
                  {purchased ? (
                    <button type="button" className="btn-sand" onClick={handleDownload} disabled={downloading} style={{ gap: 6 }}>
                      {downloading
                        ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Preparing...</>
                        : <><Download size={13} /> Download</>
                      }
                    </button>
                  ) : (
                    <button type="button" className="btn-primary" onClick={() => setShowPurchase(true)} style={{ gap: 6 }}>
                      <Wallet size={13} /> Buy with USDC
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right — Product info */}
          <div className="card" style={{ padding: 28 }}>
            <span className="badge badge-sky" style={{ marginBottom: 16, fontSize: 9 }}>
              {product.category?.name || "Digital Product"}
            </span>
            <h2 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", marginBottom: 4, color: "var(--text, white)" }}>
              {product.title}
            </h2>

            {/* Seller info */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{
                position: "relative", width: 28, height: 28, borderRadius: "50%",
                background: "rgba(110,172,218,0.1)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
              }}>
                {product.seller?.avatar_url
                  ? <Image src={product.seller.avatar_url} alt="" fill sizes="28px" style={{ objectFit: "cover" }} />
                  : <User size={13} color="var(--text-muted)" />
                }
              </div>
              <div>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  By{" "}
                  <Link href={`/shop/${product.seller_id}`} style={{ color: "var(--sky)", fontWeight: 600, textDecoration: "none" }}>
                    {product.seller?.display_name || product.seller?.username || "Unknown"}
                  </Link>
                </p>
              </div>
            </div>

            {product.short_description && (
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--sky)", marginBottom: 16 }}>{product.short_description}</p>
            )}

            {product.file_name && (
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
                File: {product.file_name}
                {product.file_size_bytes && ` (${(product.file_size_bytes / 1024 / 1024).toFixed(1)} MB)`}
              </p>
            )}

            <div className="divider" style={{ marginBottom: 20 }} />
            <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text-muted)", marginBottom: 24, whiteSpace: "pre-wrap" }}>
              {product.description}
            </p>

            {product.tags.length > 0 && (
              <>
                <div className="divider" style={{ marginBottom: 16 }} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {product.tags.map((tag) => (
                    <span key={tag} className="badge badge-sky" style={{ fontSize: 10 }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}

            <div style={{ marginTop: 16 }}>
              <button
                type="button"
                className="btn-ghost"
                disabled={alreadyReported}
                onClick={() => setShowReport(true)}
                style={{ fontSize: 11, padding: "6px 12px", color: alreadyReported ? "var(--text-muted)" : "#f87171", borderColor: "rgba(248,113,113,0.2)", opacity: alreadyReported ? 0.5 : 1 }}
              >
                <Flag size={12} /> {alreadyReported ? "Reported" : "Report Product"}
              </button>
            </div>

            <div style={{
              marginTop: 16, padding: "14px 16px", borderRadius: 10,
              background: "rgba(110,172,218,0.05)", border: "1px solid var(--border)",
              display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
            }}>
              <div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 2 }}>Price</p>
                <UsdcAmount value={product.price_usdc} iconSize={18} style={{ fontSize: 20, fontWeight: 700, color: "var(--sand)" }} />
              </div>
              {purchased ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle size={16} color="#4ade80" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#4ade80" }}>Purchased</span>
                  <button type="button" className="btn-sand" onClick={handleDownload} disabled={downloading} style={{ gap: 6, marginLeft: 8 }}>
                    <Download size={13} /> Download
                  </button>
                </div>
              ) : (
                <button type="button" className="btn-primary" onClick={() => setShowPurchase(true)} style={{ gap: 6 }}>
                  <Wallet size={13} /> Buy with USDC
                </button>
              )}
            </div>
          </div>
        </div>
        <ReviewSection productId={product.id} purchased={purchased} />
      </main>
      <MobileBottomNav />

      <PurchaseModal
        open={showPurchase}
        onClose={() => setShowPurchase(false)}
        onSuccess={handlePurchaseSuccess}
        product={{
          id: product.id,
          title: product.title,
          price_usdc: product.price_usdc,
          seller_id: product.seller_id,
          seller_wallet: product.seller?.wallet_address || "",
          thumbnail_url: product.thumbnail_url,
        }}
      />

      {/* Report Modal */}
      {showReport && (
        <div className="modal-overlay" onClick={() => setShowReport(false)}>
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ padding: 28, maxWidth: 420, width: "90%", margin: "auto" }}>
            <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 18, color: "var(--text, white)", marginBottom: 16 }}>
              <Flag size={16} color="#f87171" style={{ marginRight: 8, verticalAlign: "middle" }} />
              Report Product
            </h3>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Reason</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value as ReportReason)}
              style={{
                width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 8,
                border: "1px solid var(--border)", background: "rgba(0,0,0,0.3)",
                color: "var(--text, white)", marginBottom: 16,
              }}
            >
              <option value="copyright">Copyright / IP violation</option>
              <option value="malware">Malware / malicious code</option>
              <option value="scam">Scam / misleading</option>
              <option value="inappropriate">Inappropriate content</option>
              <option value="other">Other</option>
            </select>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Details (optional)</label>
            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Describe the issue..."
              rows={3}
              style={{
                width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 8,
                border: "1px solid var(--border)", background: "rgba(0,0,0,0.3)",
                color: "var(--text, white)", resize: "vertical", marginBottom: 20,
              }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" className="btn-ghost" onClick={() => setShowReport(false)} style={{ fontSize: 12 }}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={handleReport} disabled={reportSubmitting} style={{ fontSize: 12, background: "#ef4444", borderColor: "#ef4444" }}>
                {reportSubmitting ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Flag size={13} />}
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
