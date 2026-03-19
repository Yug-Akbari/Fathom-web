"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  TrendingUp,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";

interface InvoiceItem {
  productName: string;
  category: string;
  qty: number;
  rate: number;
  gstPercent: number;
  discountPercent: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  deliveryDate: string;
  salesperson: string;
  orderType: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerGst: string;
  billingAddress: string;
  shippingSameAsBilling: boolean;
  shippingAddress: string;
  paymentMode: string;
  dueDate: string;
  amountPaid: number;
  items: InvoiceItem[];
  transportCharges: number;
  unloadingCharges: number;
  specialNotes: string;
  subtotal: number;
  totalDiscount: number;
  totalGst: number;
  grandTotal: number;
  pendingAmount: number;
  status: "Paid" | "Partial" | "Pending";
  createdAt: any;
  updatedAt: any;
}

const ITEMS_PER_PAGE = 10;

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time Firebase listener
  useEffect(() => {
    const q = query(collection(db, "invoices"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Invoice)
      );
      setInvoices(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Close action menu on outside click
  useEffect(() => {
    const handleClick = () => setOpenMenuId(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Filtered invoices
  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      // Search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          inv.invoiceNumber?.toLowerCase().includes(term) ||
          inv.customerName?.toLowerCase().includes(term) ||
          inv.customerPhone?.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      // Date range
      if (dateFrom) {
        const invDate = new Date(inv.invoiceDate);
        const from = new Date(dateFrom);
        if (invDate < from) return false;
      }
      if (dateTo) {
        const invDate = new Date(inv.invoiceDate);
        const to = new Date(dateTo);
        if (invDate > to) return false;
      }

      // Status
      if (statusFilter !== "All" && inv.status !== statusFilter) return false;

      return true;
    });
  }, [invoices, searchTerm, dateFrom, dateTo, statusFilter]);

  // Stats (computed from ALL invoices, not filtered)
  const stats = useMemo(() => {
    const total = invoices.length;
    const paid = invoices.filter((i) => i.status === "Paid").length;
    const partial = invoices.filter((i) => i.status === "Partial").length;
    const pending = invoices.filter((i) => i.status === "Pending").length;
    const revenue = invoices.reduce((sum, i) => sum + (i.amountPaid || 0), 0);
    const outstanding = invoices.reduce(
      (sum, i) => sum + (i.pendingAmount || 0),
      0
    );
    return { total, paid, partial, pending, revenue, outstanding };
  }, [invoices]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedInvoices = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const clearFilters = () => {
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
    setStatusFilter("All");
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteDoc(doc(db, "invoices", id));
      } catch (error) {
        console.error("Error deleting invoice:", error);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
    return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  };

  const formatFullCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Paid: "bg-green-50 text-green-700 border-green-200",
      Partial: "bg-amber-50 text-amber-700 border-amber-200",
      Pending: "bg-red-50 text-red-700 border-red-200",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border ${styles[status] || "bg-gray-50 text-gray-600 border-gray-200"}`}
      >
        {status}
      </span>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 max-w-7xl mx-auto font-inter"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-3xl font-poppins font-bold text-primary mb-1">
            Invoice Management
          </h1>
          <p className="text-gray-500 text-sm">
            Create and manage customer invoices • Live from Firebase
          </p>
        </div>
        <Link
          href="/admin/invoices/new"
          className="flex items-center gap-2 bg-accent hover:bg-[#c5a130] text-white font-bold text-sm tracking-wide px-6 py-3 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {/* Total */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400">
              Total
            </span>
          </div>
          <span className="text-3xl font-poppins font-bold text-primary">
            {stats.total.toLocaleString()}
          </span>
          <span className="text-[11px] text-gray-400 mt-1">
            Invoices generated
          </span>
        </div>

        {/* Paid */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-green-600">
              Paid
            </span>
          </div>
          <span className="text-3xl font-poppins font-bold text-primary">
            {stats.paid.toLocaleString()}
          </span>
          <div className="w-full bg-gray-100 rounded-full h-1 mt-2">
            <div
              className="bg-green-500 h-1 rounded-full transition-all"
              style={{
                width: `${stats.total > 0 ? (stats.paid / stats.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Partial */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-amber-600">
              Partial
            </span>
          </div>
          <span className="text-3xl font-poppins font-bold text-primary">
            {stats.partial.toLocaleString()}
          </span>
          <span className="text-[11px] text-gray-400 mt-1">
            Awaiting balance
          </span>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-red-600">
              Pending
            </span>
          </div>
          <span className="text-3xl font-poppins font-bold text-primary">
            {stats.pending.toLocaleString()}
          </span>
          <span className="text-[11px] text-gray-400 mt-1">
            Action required
          </span>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl p-5 border border-l-4 border-accent/30 border-l-accent shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-accent">
              Revenue
            </span>
          </div>
          <span className="text-2xl font-poppins font-bold text-primary">
            {formatCurrency(stats.revenue)}
          </span>
          <span className="text-[11px] text-gray-400 mt-1">
            All-time billing
          </span>
        </div>

        {/* Outstanding */}
        <div className="bg-white rounded-xl p-5 border border-l-4 border-gray-200 border-l-primary shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-primary">
              Outstanding
            </span>
          </div>
          <span className="text-2xl font-poppins font-bold text-primary">
            {formatCurrency(stats.outstanding)}
          </span>
          <span className="text-[11px] text-gray-400 mt-1">
            Pending collection
          </span>
        </div>
      </motion.div>

      {/* Search & Filter Bar */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
      >
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Invoice ID, customer name or phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Date From */}
          <div className="relative">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              title="From date"
            />
          </div>

          {/* Date To */}
          <div className="relative">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              title="To date"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none px-4 pr-10 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-accent font-semibold"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Clear */}
        {(searchTerm || dateFrom || dateTo || statusFilter !== "All") && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 mt-3 text-sm font-semibold text-gray-500 hover:text-primary transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </motion.div>

      {/* Invoice Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">
                  Invoice
                </th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">
                  Customer Info
                </th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">
                  Total Amount
                </th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 text-center">
                  Items
                </th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">
                  Pending
                </th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">
                  Date
                </th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-semibold">
                        Loading invoices...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <FileText className="w-12 h-12 opacity-30" />
                      <span className="text-sm font-semibold">
                        No invoices found
                      </span>
                      <Link
                        href="/admin/invoices/new"
                        className="text-accent hover:text-[#c5a130] text-sm font-bold"
                      >
                        Create your first invoice →
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => {
                  const initials = inv.customerName
                    ? inv.customerName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "?";

                  const itemCount = inv.items?.length || 0;
                  const formattedDate = inv.invoiceDate
                    ? new Date(inv.invoiceDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      {/* Invoice ID */}
                      <td className="px-6 py-5">
                        <button
                          onClick={() =>
                            router.push(`/admin/invoices/${inv.id}`)
                          }
                          className="font-bold text-primary hover:text-accent transition-colors"
                        >
                          #{inv.invoiceNumber}
                        </button>
                      </td>

                      {/* Customer Info */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-accent">
                              {initials}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-primary text-sm truncate">
                              {inv.customerName || "—"}
                            </span>
                            <span className="text-xs text-gray-400 truncate">
                              {inv.customerPhone || "—"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="px-6 py-5 font-bold text-primary">
                        {formatFullCurrency(inv.grandTotal || 0)}
                      </td>

                      {/* Items */}
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded border border-gray-200 text-xs font-semibold text-gray-600">
                          {itemCount}{" "}
                          <span className="text-gray-400 ml-1 font-normal">
                            {itemCount === 1 ? "item" : "items"}
                          </span>
                        </span>
                      </td>

                      {/* Pending */}
                      <td className="px-6 py-5">
                        {(inv.pendingAmount || 0) > 0 ? (
                          <span className="font-semibold text-red-600">
                            {formatFullCurrency(inv.pendingAmount)}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">{statusBadge(inv.status)}</td>

                      {/* Date */}
                      <td className="px-6 py-5 text-gray-500 whitespace-nowrap text-sm">
                        {formattedDate}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              router.push(`/admin/invoices/${inv.id}`)
                            }
                            className="p-1.5 bg-gray-50 text-gray-500 hover:text-primary hover:bg-gray-200 rounded transition-colors"
                            title="View Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/admin/invoices/${inv.id}/edit`)
                            }
                            className="p-1.5 bg-gray-50 text-gray-500 hover:text-primary hover:bg-gray-200 rounded transition-colors"
                            title="Edit Invoice"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(inv.id)}
                            className="p-1.5 bg-red-50 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-bold text-primary">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-primary">
                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-primary">
                {filtered.length.toLocaleString()}
              </span>{" "}
              results
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                      currentPage === pageNum
                        ? "bg-accent text-white"
                        : "border border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
