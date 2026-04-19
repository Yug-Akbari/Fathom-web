"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface ReviewFormProps {
  productId: string;
  productName: string;
  onClose: () => void;
}

const PLATFORMS = ["FATHOM Website", "Amazon", "Flipkart", "Other"];

const ratingLabels: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export default function ReviewForm({ productId, productName, onClose }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!rating) return setError("Please select a star rating.");
    if (!name.trim()) return setError("Please enter your name.");
    if (!platform) return setError("Please select the platform.");
    if (!orderNumber.trim()) return setError("Please enter your order number.");
    if (!description.trim()) return setError("Please write a review.");
    setLoading(true);
    setError("");
    try {
      await addDoc(collection(db, "reviews"), {
        productId,
        productName,
        customerName: name.trim(),
        platform,
        orderNumber: orderNumber.trim(),
        title: title.trim(),
        description: description.trim(),
        rating,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeRating = hovered || rating;

  const inputClass =
    "w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-amber-400/60 focus:bg-white/8 transition-all placeholder:text-white/20 font-inter rounded-lg backdrop-blur-sm";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.75)" }}
        onClick={onClose}
      >
        {/* Ambient glow blobs behind modal */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full opacity-20 blur-[120px]" style={{ background: "radial-gradient(circle, #b8952b, transparent)" }} />
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full opacity-10 blur-[100px]" style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 28 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="w-full max-w-[480px] relative rounded-2xl overflow-hidden"
          style={{
            background: "rgba(18, 18, 18, 0.85)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-10 py-16 text-center flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              >
                <CheckCircle2 className="w-16 h-16 text-amber-400 mb-6" strokeWidth={1.2} />
              </motion.div>
              <h3 className="font-poppins font-bold text-white text-2xl mb-3">Review Submitted</h3>
              <p className="text-white/40 text-sm font-inter leading-relaxed max-w-[260px]">
                Your review is pending verification and will appear once approved.
              </p>
              <button
                onClick={onClose}
                className="mt-10 px-10 py-3 text-[10px] font-bold tracking-[0.25em] uppercase text-black bg-amber-400 hover:bg-amber-300 transition-colors rounded-lg"
              >
                Close
              </button>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <div className="px-7 pt-7 pb-5 flex items-start justify-between"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div>
                  <h2 className="font-poppins font-bold text-white text-xl mb-1">Leave a Review</h2>
                  <p className="text-white/30 text-xs font-inter">Your feedback helps other buyers make informed decisions.</p>
                </div>
                <button onClick={onClose} className="text-white/30 hover:text-white transition-colors mt-0.5">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Product pill */}
              <div className="px-7 pt-5">
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold font-poppins leading-tight">{productName}</p>
                    <p className="text-white/25 text-[10px] font-inter tracking-wide mt-0.5">FATHOM Store</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="px-7 py-5 flex flex-col gap-5 max-h-[58vh] overflow-y-auto">

                {/* Stars */}
                <div>
                  <label className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/30 block mb-3">Overall Rating *</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        whileHover={{ scale: 1.25 }}
                        whileTap={{ scale: 0.9 }}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-all duration-100 ${star <= activeRating
                              ? "text-amber-400 fill-amber-400"
                              : "text-white/10 fill-white/10"
                            }`}
                          style={star <= activeRating ? { filter: "drop-shadow(0 0 6px rgba(251,191,36,0.5))" } : {}}
                        />
                      </motion.button>
                    ))}
                    <AnimatePresence mode="wait">
                      {activeRating > 0 && (
                        <motion.span
                          key={activeRating}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-[11px] font-bold text-amber-400 tracking-widest uppercase ml-2"
                        >
                          {ratingLabels[activeRating]}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Name + Platform */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/30 block mb-2">Full Name *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/30 block mb-2">Platform *</label>
                    <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={inputClass + " cursor-pointer appearance-none"}>
                      <option value="" disabled className="bg-[#1a1a1a]">Select</option>
                      {PLATFORMS.map((p) => <option key={p} value={p} className="bg-[#1a1a1a]">{p}</option>)}
                    </select>
                  </div>
                </div>

                {/* Order Number */}
                <div>
                  <label className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/30 block mb-2">Order Number *</label>
                  <input type="text" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="e.g. FAT-2024-001 or Amazon order ID" className={inputClass} />
                </div>

                {/* Review Title */}
                <div>
                  <label className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/30 block mb-2">Review Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summarize your experience" className={inputClass} />
                </div>

                {/* Detailed Review */}
                <div>
                  <label className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/30 block mb-2">Detailed Review *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What did you like or dislike? What should other buyers know?"
                    rows={4}
                    className={inputClass + " resize-none leading-relaxed"}
                  />
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs font-inter">
                    {error}
                  </motion.p>
                )}

                {/* Actions */}
                <div className="flex gap-3 pb-1">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3.5 text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors rounded-lg"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={handleSubmit}
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-[2] py-3.5 text-[10px] font-bold tracking-[0.2em] uppercase text-black bg-amber-400 hover:bg-amber-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded-lg"
                  >
                    {loading ? "Submitting..." : "Submit Review"}
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
