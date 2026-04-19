"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import ReviewForm from "./ReviewForm";

interface Review {
  id: string;
  customerName: string;
  platform: string;
  rating: number;
  title: string;
  description: string;
  createdAt: any;
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const sz = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${sz} ${s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "reviews"),
      where("productId", "==", productId),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Review)));
      setLoading(false);
    });
    return () => unsub();
  }, [productId]);

  const avgRating = reviews.length
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  const formatDate = (ts: any) => {
    if (!ts) return "";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <>
      {showForm && (
        <ReviewForm
          productId={productId}
          productName={productName}
          onClose={() => setShowForm(false)}
        />
      )}

      <section className="max-w-[1400px] mx-auto px-6 pb-24">
        <div className="border-t border-gray-200 pt-16">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">Customer Reviews</p>
              {reviews.length > 0 ? (
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-poppins font-bold text-primary">{avgRating}</span>
                  <div>
                    <StarDisplay rating={Math.round(avgRating)} size="lg" />
                    <p className="text-xs text-gray-400 font-inter mt-1">{reviews.length} verified review{reviews.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              ) : (
                <p className="text-2xl font-poppins font-bold text-primary">No reviews yet</p>
              )}
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-8 py-4 border border-gray-300 text-primary text-[10px] font-bold tracking-[0.2em] uppercase hover:border-primary transition-colors self-start sm:self-auto whitespace-nowrap"
            >
              Write a Review
            </button>
          </div>

          {/* Reviews Grid */}
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm font-inter">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="border border-dashed border-gray-200 py-16 text-center">
              <Star className="w-8 h-8 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-sm font-inter">Be the first to review this product</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-6 px-6 py-3 bg-primary text-white text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-accent transition-colors"
              >
                Write a Review
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border border-gray-100 p-6 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <StarDisplay rating={review.rating} />
                      {review.title && (
                        <h4 className="font-poppins font-bold text-primary text-sm mt-1">{review.title}</h4>
                      )}
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white bg-primary px-2 py-1 shrink-0">
                      {review.platform}
                    </span>
                  </div>
                  <p className="text-sm font-inter text-gray-600 leading-relaxed">{review.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs font-bold text-primary">{review.customerName}</span>
                    <span className="text-[10px] text-gray-400 font-inter">{formatDate(review.createdAt)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
