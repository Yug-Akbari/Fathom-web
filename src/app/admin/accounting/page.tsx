"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Download, 
  Plus, 
  ShoppingCart, 
  CornerUpLeft, 
  Percent, 
  ClipboardList, 
  FilePlus, 
  Search, 
  Filter,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp, 
  query, 
  orderBy 
} from "firebase/firestore";

interface AccountingEntry {
  id: string;
  refId: string;
  date: string;
  type: string;
  amount: string;
  status: string;
  paymentIconName?: string; // Storing icon name string to save in Firebase
  paymentText?: string;
  sku: string;
  notified: boolean;
  returnType: string;
  state: string;
  reimbursement: string;
  note: string;
  createdAt: any;
}

export default function AccountingPage() {
  const [shipDate, setShipDate] = useState("");
  const [orderId, setOrderId] = useState("");
  const [type, setType] = useState("FBA");
  const [amount, setAmount] = useState("");
  const [returnType, setReturnType] = useState("");
  const [state, setState] = useState("");
  const [reimbursement, setReimbursement] = useState("");
  const [sku, setSku] = useState("");
  const [notified, setNotified] = useState(true);
  const [note, setNote] = useState("");
  const [filterSku, setFilterSku] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof AccountingEntry | null, direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch entries from Firebase
  useEffect(() => {
    const q = query(collection(db, "accounting_entries"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEntries: AccountingEntry[] = [];
      snapshot.forEach((doc) => {
        fetchedEntries.push({ id: doc.id, ...doc.data() } as AccountingEntry);
      });
      setEntries(fetchedEntries);
    });

    return () => unsubscribe();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const clearForm = () => {
    setShipDate("");
    setOrderId("");
    setType("FBA");
    setAmount("");
    setReturnType("");
    setState("");
    setReimbursement("");
    setSku("");
    setNotified(true);
    setNote("");
    setEditingId(null);
  };

  const handleCreateOrUpdateEntry = async () => {
    setIsLoading(true);
    const entryData = {
      refId: orderId || `#${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: type,
      amount: amount.startsWith('₹') || amount.startsWith('-') ? amount : `₹${amount || '0.00'}`,
      status: "Completed",
      sku: sku || "N/A",
      notified: notified,
      returnType: returnType,
      state: state,
      reimbursement: reimbursement,
      note: note,
    };
    
    try {
      if (editingId) {
        // Update existing
        await updateDoc(doc(db, "accounting_entries", editingId), entryData);
      } else {
        // Create new
        await addDoc(collection(db, "accounting_entries"), {
          ...entryData,
          createdAt: serverTimestamp()
        });
      }
      clearForm();
    } catch (error) {
      console.error("Error saving entry: ", error);
      alert("Failed to save entry. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (entry: AccountingEntry) => {
    setOrderId(entry.refId.replace('#', ''));
    setType(entry.type);
    setAmount(entry.amount.replace('₹', ''));
    setReturnType(entry.returnType || "");
    setState(entry.state || "");
    setReimbursement(entry.reimbursement || "");
    setSku(entry.sku === "N/A" ? "" : entry.sku);
    setNotified(entry.notified);
    setNote(entry.note || "");
    setEditingId(entry.id);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      setIsLoading(true);
      try {
        await deleteDoc(doc(db, "accounting_entries", id));
      } catch (error) {
        console.error("Error deleting entry: ", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredEntries = filterSku 
    ? entries.filter(entry => entry.sku.toLowerCase().includes(filterSku.toLowerCase()))
    : entries;

  const searchedEntries = searchTerm
    ? filteredEntries.filter(entry => {
        const term = searchTerm.toLowerCase();
        return (
          (entry.refId && entry.refId.toLowerCase().includes(term)) ||
          (entry.date && entry.date.toLowerCase().includes(term)) ||
          (entry.sku && entry.sku.toLowerCase().includes(term)) ||
          (entry.type && entry.type.toLowerCase().includes(term)) ||
          (entry.amount && entry.amount.toLowerCase().includes(term)) ||
          (entry.status && entry.status.toLowerCase().includes(term)) ||
          (entry.state && entry.state.toLowerCase().includes(term)) ||
          (entry.note && entry.note.toLowerCase().includes(term))
        );
      })
    : filteredEntries;

  const sortedEntries = [...searchedEntries].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aVal: any = a[sortConfig.key];
    let bVal: any = b[sortConfig.key];

    if (sortConfig.key === 'amount') {
       aVal = parseFloat(String(aVal).replace(/[^0-9.-]+/g,"")) || 0;
       bVal = parseFloat(String(bVal).replace(/[^0-9.-]+/g,"")) || 0;
    } else if (sortConfig.key === 'date') {
       aVal = new Date(aVal as string).getTime();
       bVal = new Date(bVal as string).getTime();
    } else {
       aVal = String(aVal).toLowerCase();
       bVal = String(bVal).toLowerCase();
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: keyof AccountingEntry) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof AccountingEntry }) => {
    if (sortConfig.key !== columnKey) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-gray-600 ml-1 font-bold">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const totalOrders = filteredEntries.length;
  const returns = filteredEntries.filter(entry => entry.notified === true).length;
  const returnRatio = totalOrders > 0 ? ((returns / totalOrders) * 100).toFixed(1) : "0.0";
  const rtoCount = filteredEntries.filter(entry => entry.returnType === "RTO").length;
  const customerCount = filteredEntries.filter(entry => entry.returnType === "Customer").length;
  const replacementCount = filteredEntries.filter(entry => entry.returnType === "Replacement").length;
  
  const totalSales = filteredEntries.reduce((sum, entry) => {
    const amt = parseFloat(entry.amount.replace(/[^0-9.-]+/g,"")) || 0;
    return sum + amt;
  }, 0);

  const totalReturnAmount = filteredEntries.reduce((sum, entry) => {
    if (entry.notified === true || entry.returnType === "Customer" || entry.returnType === "RTO" || entry.returnType === "Replacement") {
      const amt = parseFloat(entry.amount.replace(/[^0-9.-]+/g,"")) || 0;
      return sum + amt;
    }
    return sum;
  }, 0);
  
  const netSales = totalSales - totalReturnAmount;
  
  const salesPercentage = totalSales > 0 ? ((netSales / totalSales) * 100).toFixed(1) : "0.0";

  const totalReimbursement = filteredEntries.reduce((sum, entry) => {
    const amt = parseFloat((entry.reimbursement || "").replace(/[^0-9.-]+/g,"")) || 0;
    return sum + amt;
  }, 0);

  // Extract unique SKUs for datalist
  const uniqueSkus = Array.from(new Set(entries.map(e => e.sku).filter(Boolean)));

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 font-inter">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-poppins text-primary">Accounting & Order Entry</h1>
          <p className="text-gray-500 mt-1">Manage financial records, reimbursements, and operational expenses.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
           {/* Global SKU Filter */}
           <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Filter stats by SKU..."
                value={filterSku}
                onChange={(e) => setFilterSku(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-3 py-2 bg-white rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] shadow-sm"
              />
            </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                const headers = ["Ref ID", "Date", "SKU", "Type", "Amount", "Status", "Return Type", "State", "Reimbursement", "Notified", "Note"];
                const rows = sortedEntries.map(e => [
                  e.refId, e.date, e.sku, e.type, e.amount, e.status, 
                  e.returnType || "", e.state || "", e.reimbursement || "", e.notified ? "Yes" : "No", e.note || ""
                ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
                const csv = [headers.join(","), ...rows].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `accounting_export_${new Date().toISOString().slice(0,10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button 
              onClick={clearForm}
              className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#c5a130] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-xs font-bold text-gray-500 tracking-wider">TOTAL ORDERS</span>
          </div>
          <div className="flex items-baseline gap-3 relative z-10">
            <span className="text-3xl font-extrabold font-poppins text-gray-900">{totalOrders}</span>
            <span className="flex items-center text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              Matched
            </span>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-xs font-bold text-gray-500 tracking-wider">TOTAL SALES</span>
          </div>
          <div className="flex items-baseline gap-3 relative z-10">
            <span className="text-3xl font-extrabold font-poppins text-gray-900">
              ₹{totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="flex items-center text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              Gross
            </span>
          </div>
        </div>

        {/* Net Sales */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-xs font-bold text-gray-500 tracking-wider">NET SALES</span>
          </div>
          <div className="flex items-baseline gap-3 relative z-10">
            <span className="text-3xl font-extrabold font-poppins text-gray-900">
              ₹{netSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="flex items-center text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              Net
            </span>
          </div>
        </div>

        {/* Sales Percentage */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-xs font-bold text-gray-500 tracking-wider">SALES PERCENTAGE</span>
          </div>
          <div className="flex items-baseline gap-3 relative z-10">
            <span className="text-3xl font-extrabold font-poppins text-gray-900">{salesPercentage}%</span>
            <span className="flex items-center text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
              of Gross
            </span>
          </div>
        </div>

        {/* Returns */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-xs font-bold text-gray-500 tracking-wider">RETURNS</span>
          </div>
          <div className="flex items-baseline gap-3 relative z-10">
            <span className="text-3xl font-extrabold font-poppins text-gray-900">{returns}</span>
            <span className="flex items-center text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
              (Notified)
            </span>
          </div>
        </div>

        {/* RTO Returns */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-xs font-bold text-gray-500 tracking-wider">RTO RETURNS</span>
          </div>
          <div className="flex items-baseline gap-3 relative z-10">
            <span className="text-3xl font-extrabold font-poppins text-gray-900">{rtoCount}</span>
            <span className="flex items-center text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
              RTO
            </span>
          </div>
        </div>

        {/* Customer Returns */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-xs font-bold text-gray-500 tracking-wider">CUSTOMER RTN</span>
          </div>
          <div className="flex items-baseline gap-3 relative z-10">
            <span className="text-3xl font-extrabold font-poppins text-gray-900">{customerCount}</span>
            <span className="flex items-center text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
              Customer
            </span>
          </div>
        </div>

        {/* Replacement */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-xs font-bold text-gray-500 tracking-wider">REPLACEMENT</span>
          </div>
          <div className="flex items-baseline gap-3 relative z-10">
            <span className="text-3xl font-extrabold font-poppins text-gray-900">{replacementCount}</span>
            <span className="flex items-center text-xs font-semibold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
              Replaced
            </span>
          </div>
        </div>

        {/* Return Ratio */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-xs font-bold text-gray-500 tracking-wider">RETURN RATIO</span>
          </div>
          <div className="flex items-baseline gap-3 relative z-10">
            <span className="text-3xl font-extrabold font-poppins text-gray-900">{returnRatio}%</span>
            <span className="text-xs text-gray-500">of selection</span>
          </div>
        </div>

        {/* Active SKUs */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-xs font-bold text-gray-500 tracking-wider">ACTIVE SKUS</span>
          </div>
          <div className="flex items-baseline gap-3 relative z-10">
            <span className="text-3xl font-extrabold font-poppins text-gray-900">{uniqueSkus.length}</span>
            <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
              Total
            </span>
          </div>
        </div>

        {/* Total Reimbursement */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-xs font-bold text-gray-500 tracking-wider">REIMBURSEMENT</span>
          </div>
          <div className="flex items-baseline gap-3 relative z-10">
            <span className="text-3xl font-extrabold font-poppins text-gray-900">
              ₹{totalReimbursement.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="flex items-center text-xs font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
              Total
            </span>
          </div>
        </div>
      </div>

      {/* Add / Edit New Entry Form */}
      <div className={`bg-white rounded-xl p-6 shadow-sm border transition-colors ${editingId ? 'border-[#D4AF37] bg-[#fcf9ed]/30' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded flex items-center justify-center ${editingId ? 'bg-[#D4AF37] text-white' : 'bg-[#fcf9ed] text-[#D4AF37]'}`}>
              {editingId ? <Edit className="w-4 h-4" /> : <FilePlus className="w-4 h-4" />}
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {editingId ? 'Edit Entry' : 'Add New Entry'}
            </h2>
          </div>
          {editingId && (
            <button onClick={clearForm} className="text-sm font-semibold text-gray-500 hover:text-gray-800">
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
          {/* Row 1 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 tracking-wider">SHIP DATE</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              value={shipDate}
              onChange={(e) => setShipDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 tracking-wider">ORDER ID</label>
            <input 
              type="text" 
              placeholder="e.g. #ORD-1234"
              className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 tracking-wider">SKU</label>
            <input 
              type="text" 
              placeholder="e.g. FTH-001"
              list="sku-options"
              className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
            <datalist id="sku-options">
              {uniqueSkus.map((s, i) => (
                <option key={i} value={s} />
              ))}
            </datalist>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 tracking-wider">TYPE</label>
            <div className="relative">
              <select 
                className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="FBA">FBA</option>
                <option value="FBM">FBM</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-gray-500 tracking-wider">AMOUNT</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                ₹
              </div>
              <input 
                type="text" 
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          {/* Row 2 */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-gray-500 tracking-wider">STATE / ADDRESS</label>
            <input 
              type="text" 
              placeholder="Enter full address"
              className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 tracking-wider">RETURN TYPE</label>
            <div className="relative">
              <select 
                className={`w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-[#D4AF37] ${!returnType ? 'text-gray-400' : 'text-gray-900'}`}
                value={returnType}
                onChange={(e) => setReturnType(e.target.value)}
              >
                <option value="">None (Select...)</option>
                <option value="Customer">Customer</option>
                <option value="RTO">RTO</option>
                <option value="Replacement">Replacement</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-1">
            <label className="text-xs font-bold text-gray-500 tracking-wider">REIMBURSEMENT</label>
            <input 
              type="text" 
              placeholder="E.g. Full amount"
              className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              value={reimbursement}
              onChange={(e) => setReimbursement(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5 justify-end">
             <label className="text-xs font-bold text-gray-500 tracking-wider">NOTIFIED (RETURN)</label>
             <div className="flex items-center gap-3 h-[38px]">
               <button 
                 onClick={() => setNotified(!notified)} 
                 className={`w-10 h-5 rounded-full relative transition-colors ${notified ? 'bg-green-500' : 'bg-gray-300'}`}
               >
                 <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${notified ? 'translate-x-5' : 'translate-x-1'}`}></div>
               </button>
               <span className="text-sm font-medium text-gray-700">{notified ? 'Yes' : 'No'}</span>
             </div>
          </div>
          <div className="flex flex-col justify-end">
            <button 
              onClick={handleCreateOrUpdateEntry}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 h-[38px] rounded-lg text-white text-sm font-semibold transition-all shadow-sm ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${editingId ? 'bg-[#D4AF37] hover:bg-[#c5a130]' : 'bg-primary hover:bg-gray-800'}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : editingId ? 'Update Entry' : 'Create Entry'}
            </button>
          </div>
        </div>
        
        {/* Row 3 - Note */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 tracking-wider">NOTE</label>
          <textarea 
            placeholder="Add any additional details here..."
            className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] min-h-[50px] resize-y"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>

      {/* Recent Entries Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Entries</h2>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="text-xs font-bold text-gray-500 tracking-wider border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('refId')}>REF ID <SortIcon columnKey="refId" /></th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('sku')}>SKU <SortIcon columnKey="sku" /></th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('type')}>TYPE <SortIcon columnKey="type" /></th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('amount')}>AMOUNT <SortIcon columnKey="amount" /></th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('status')}>STATUS <SortIcon columnKey="status" /></th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('state')}>STATE <SortIcon columnKey="state" /></th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('reimbursement')}>REIMBURSEMENT <SortIcon columnKey="reimbursement" /></th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div>No entries match your search/filters.</div>
                  </td>
                </tr>
              ) : (
                sortedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{entry.refId}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">{entry.sku}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        entry.type === 'FBA' 
                          ? 'bg-blue-50 text-blue-600' 
                          : entry.type === 'FBM' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{entry.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        entry.status === 'Completed' 
                          ? 'border-green-200 bg-green-50 text-green-700' 
                          : 'border-yellow-200 bg-yellow-50 text-yellow-700'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          entry.status === 'Completed' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate" title={entry.state || ''}>{entry.state || <span className="text-gray-400">—</span>}</td>
                    <td className="px-6 py-4 text-gray-600">{entry.reimbursement || <span className="text-gray-400">—</span>}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEditClick(entry)}
                          disabled={isLoading}
                          className="p-1.5 bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                          title="Edit Entry"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(entry.id)}
                          disabled={isLoading}
                          className="p-1.5 bg-red-50 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
