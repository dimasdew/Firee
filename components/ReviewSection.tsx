"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, Send, Loader2, User } from "lucide-react";
import { getProductReviews, createReview } from "../lib/supabase/reviews";
import { createClient } from "../lib/supabase/client";
import { useApp } from "../context/AppContext";
import type { Review } from "../lib/supabase/types";
import { timeAgo } from "../lib/utils";

interface Props {
  productId: string;
  purchased: boolean;
}

function StarRating({ value, onChange, size = 18 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 2, cursor: onChange ? "pointer" : "default" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={(hover || value) >= i ? "#facc15" : "none"}
          color={(hover || value) >= i ? "#facc15" : "var(--text-muted)"}
          style={{ transition: "all 0.15s" }}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange?.(i)}
        />
      ))}
    </div>
  );
}

export function StarDisplay({ avg, count, size = 13 }: { avg: number; count: number; size?: number }) {
  if (count === 0) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <Star size={size} fill="#facc15" color="#facc15" />
      <span style={{ fontSize: size - 1, fontWeight: 600, color: "var(--text, white)" }}>
        {avg.toFixed(1)}
      </span>
      <span style={{ fontSize: size - 2, color: "var(--text-muted)" }}>
        ({count})
      </span>
    </div>
  );
}

export default function ReviewSection({ productId, purchased }: Props) {
  const { showToast } = useApp();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      const data = await getProductReviews(productId);
      setReviews(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Get current user and check if they can review
  useEffect(() => {
    if (!purchased) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      // Get the order ID for this product
      supabase
        .from("orders")
        .select("id")
        .eq("buyer_id", user.id)
        .eq("product_id", productId)
        .eq("status", "completed")
        .limit(1)
        .single()
        .then(({ data: order }) => {
          if (order) {
            setOrderId(order.id);
            // Check if already reviewed
            supabase
              .from("reviews")
              .select("id")
              .eq("buyer_id", user.id)
              .eq("order_id", order.id)
              .single()
              .then(({ data: review }) => {
                if (review) setHasReviewed(true);
              });
          }
        });
    });
  }, [purchased, productId]);

  const handleSubmit = async () => {
    if (!userId || !orderId || rating === 0) {
      showToast("Please select a rating");
      return;
    }
    setSubmitting(true);
    try {
      const newReview = await createReview({
        order_id: orderId,
        buyer_id: userId,
        product_id: productId,
        rating,
        comment: comment.trim() || undefined,
      });
      setReviews((prev) => [newReview, ...prev]);
      setHasReviewed(true);
      setRating(0);
      setComment("");
      showToast("Review submitted!");
    } catch (err: any) {
      if (err?.message?.includes("duplicate")) {
        showToast("You already reviewed this product");
        setHasReviewed(true);
      } else {
        showToast("Failed to submit review");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const avg = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="card" style={{ padding: 24, marginTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text, white)" }}>Reviews</h3>
        {reviews.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StarDisplay avg={avg} count={reviews.length} size={14} />
          </div>
        )}
      </div>

      {/* Review form */}
      {purchased && !hasReviewed && orderId && (
        <div style={{
          padding: 16, borderRadius: 10, marginBottom: 20,
          border: "1px solid var(--border)", background: "rgba(110,172,218,0.03)",
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text, white)", marginBottom: 10 }}>
            Write a review
          </p>
          <div style={{ marginBottom: 12 }}>
            <StarRating value={rating} onChange={setRating} size={22} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience (optional)"
            maxLength={500}
            style={{
              width: "100%", minHeight: 72, padding: "10px 12px", borderRadius: 8,
              border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)",
              color: "var(--text, white)", fontSize: 13, resize: "vertical",
              fontFamily: "inherit",
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              style={{ fontSize: 12, padding: "8px 16px", gap: 6 }}
            >
              {submitting ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={13} />}
              Submit
            </button>
          </div>
        </div>
      )}

      {purchased && hasReviewed && (
        <p style={{ fontSize: 12, color: "var(--sky)", marginBottom: 16 }}>
          ✓ You have reviewed this product
        </p>
      )}

      {/* Reviews list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <Loader2 size={20} color="var(--sky)" style={{ margin: "0 auto", animation: "spin 1s linear infinite" }} />
        </div>
      ) : reviews.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>
          No reviews yet
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                padding: 14, borderRadius: 10,
                border: "1px solid var(--border)",
                background: "rgba(110,172,218,0.02)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "rgba(110,172,218,0.1)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                }}>
                  {review.buyer?.avatar_url
                    ? <img src={review.buyer.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <User size={13} color="var(--text-muted)" />
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text, white)" }}>
                    {review.buyer?.display_name || review.buyer?.username || "User"}
                  </p>
                  <p style={{ fontSize: 10, color: "var(--text-muted)" }}>{timeAgo(review.created_at)}</p>
                </div>
                <StarRating value={review.rating} size={12} />
              </div>
              {review.comment && (
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
