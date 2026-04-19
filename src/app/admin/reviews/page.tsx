"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Check, X, Clock } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

interface Review {
  id: string;
  productName: string;
  customerName: string;
  platform: string;
  orderNumber: string;
  rating: number;
  title: string;
  description: string;
  status: "pending" | "approved" | "declined";
  createdAt: any;
}

type Tab = "pending" | "approved" | "declined";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tab, setTab] = useState<Tab>("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Review)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleApprove = async (id: string) => {
    await updateDoc(doc(db, "reviews", id), { status: "approved" });
  };

  const handleDecline = async (id: string) => {
    await updateDoc(doc(db, "reviews", id), { status: "declined" });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently delete this review?")) {
      await deleteDoc(doc(db, "reviews", id));
    }
  };

  const filtered = reviews.filter((r) => r.status === tab);
  const counts = {
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    declined: reviews.filter((r) => r.status === "declined").length,
  };

  const formatDate = (ts: any) => {
    if (!ts) return "—";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "pending", label: "Pending", icon: Clock },
    { key: "approved", label: "Approved", icon: Check },
    { key: "declined", label: "Declined", icon: X },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-8 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-primary mb-2">Reviews</h1>
          <p className="text-gray-500 font-inter text-sm">Verify and manage customer reviews before they go live.</p>
        </div>
        <div className="flex gap-4 text-sm font-inter">
          <div className="bg-white border border-gray-100 shadow-sm px-5 py-3 rounded-xl flex flex-col items-center">
            <span className="text-2xl font-poppins font-bold text-amber-500">{counts.pending}</span>
            <span className="text-[10px] tracking-widest uppercase text-gray-400">Pending</span>
          </div>
          <div className="bg-white border border-gray-100 shadow-sm px-5 py-3 rounded-xl flex flex-col items-center">
            <span className="text-2xl font-poppins font-bold text-green-600">{counts.approved}</span>
            <span className="text-[10px] tracking-widest uppercase text-gray-400">Approved</span>
          </div>
          <div className="bg-white border border-gray-100 shadow-sm px-5 py-3 rounded-xl flex flex-col items-center">
            <span className="text-2xl font-poppins font-bold text-red-500">{counts.declined}</span>
            <span className="text-[10px] tracking-widest uppercase text-gray-400">Declined</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-6 py-3 text-[11px] font-bold tracking-[0.15em] uppercase border-b-2 transition-colors ${
              tab === key
                ? "border-primary text-primary"
                : "border-transparent text-gray-400 hover:text-primary"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
              tab === key ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
            }`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 font-inter text-sm">Loading reviews...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Star className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-inter text-sm">No {tab} reviews</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Product", "Customer", "Rating", "Platform", "Order No.", "Date", "Review", "Actions"].map((h) => (
                    <th key={h} className="py-4 px-5 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-5">
                      <span className="font-semibold text-sm text-primary max-w-[140px] block truncate">{review.productName}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-sm font-inter text-primary whitespace-nowrap">{review.customerName}</span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-1">
                        <StarDisplay rating={review.rating} />
                        <span className="text-[10px] text-gray-400">{review.rating}/5</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-block bg-gray-100 text-gray-600 text-[10px] font-bold tracking-wide px-2 py-1 uppercase">
                        {review.platform}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-xs font-mono text-gray-500">{review.orderNumber}</span>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="text-xs font-inter text-gray-400">{formatDate(review.createdAt)}</span>
                    </td>
                    <td className="py-4 px-5 max-w-[220px]">
                      {review.title && (
                        <p className="text-xs font-bold text-primary mb-1">{review.title}</p>
                      )}
                      <p className="text-xs font-inter text-gray-500 line-clamp-2 leading-relaxed">{review.description}</p>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex gap-2 items-center">
                        {tab === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(review.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold tracking-wide uppercase hover:bg-green-100 transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleDecline(review.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold tracking-wide uppercase hover:bg-red-100 transition-colors"
                            >
                              <X className="w-3 h-3" />
                              Decline
                            </button>
                          </>
                        )}
                        {tab === "approved" && (
                          <button
                            onClick={() => handleDecline(review.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold tracking-wide uppercase hover:bg-red-100 transition-colors"
                          >
                            <X className="w-3 h-3" />
                            Revoke
                          </button>
                        )}
                        {tab === "declined" && (
                          <>
                            <button
                              onClick={() => handleApprove(review.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold tracking-wide uppercase hover:bg-green-100 transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleDelete(review.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-500 text-[10px] font-bold tracking-wide uppercase hover:bg-gray-100 transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
