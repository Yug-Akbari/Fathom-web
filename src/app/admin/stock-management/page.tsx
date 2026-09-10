"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, addDoc, serverTimestamp, getDocs, where, deleteDoc } from "firebase/firestore";
import { Plus, X, Search, Package, DollarSign, Edit2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TRACKING_START_DATE = new Date("2026-09-10T00:00:00.000Z").getTime();

const getTimestamp = (ts: any) => {
  if (!ts) return 0;
  return ts.toMillis ? ts.toMillis() : new Date(ts).getTime();
};

interface StockSummary {
  sku: string;
  name: string;
  stock: number;
  price: number;
  totalValue: number;
}

export default function StockManagement() {
  const [summaries, setSummaries] = useState<StockSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newCost, setNewCost] = useState("");

  // Edit states
  const [editingItem, setEditingItem] = useState<StockSummary | null>(null);
  const [editName, setEditName] = useState("");
  const [editStockQty, setEditStockQty] = useState("");
  const [editPrice, setEditPrice] = useState("");

  useEffect(() => {
    // We listen to both stock_entries and accounting_entries
    const stockQ = query(collection(db, "stock_entries"));
    const accQ = query(collection(db, "accounting_entries"));

    const unsubStock = onSnapshot(stockQ, (stockSnap) => {
      const unsubAcc = onSnapshot(accQ, (accSnap) => {
        const skuMap = new Map<string, StockSummary>();

        // Sort stock docs by createdAt locally to ensure latest price overwrites properly
        const sortedStockDocs = [...stockSnap.docs].sort((a, b) => {
          const tA = getTimestamp(a.data().createdAt || a.data().date);
          const tB = getTimestamp(b.data().createdAt || b.data().date);
          return tA - tB;
        });

        // 1. Process Stock Entries (Inbound & Return-Sellable)
        sortedStockDocs.forEach(doc => {
          const data = doc.data();
          if (getTimestamp(data.createdAt || data.date) < TRACKING_START_DATE) return;
          
          if (data.status !== "Excluded" && (data.type === "Inbound" || data.type === "Return-Sellable" || !data.type)) {
            const sku = data.sku_id || "Unknown";
            const qty = Number(data.stock_qty || data.qty || 0);
            const price = Number(data.cost || data.price || 0);
            
            if (!skuMap.has(sku)) {
              skuMap.set(sku, { sku, name: data.name || sku, stock: 0, price: 0, totalValue: 0 });
            }
            
            const current = skuMap.get(sku)!;
            current.stock += qty;
            // Keep the latest price we encounter
            if (price > 0) current.price = price;
            
            // Only override name if it's an Inbound entry (manual add/edit), 
            // or if we don't have a valid name yet.
            if (data.name) {
              if (data.type === "Inbound") {
                current.name = data.name;
              } else if (!current.name || current.name === sku) {
                current.name = data.name;
              }
            }
          }
        });

        // 2. Process Accounting Entries (Sales/Deductions)
        accSnap.forEach(doc => {
          const data = doc.data();
          if (getTimestamp(data.createdAt || data.date) < TRACKING_START_DATE) return;

          // If it's a sale from FBA, FBM, or Offline
          if (data.type === "FBA" || data.type === "FBM" || data.type === "Offline" || data.type === "Order") {
            const sku = data.sku || "Unknown";
            const qty = Number(data.quantity || 1);

            // Only deduct if we are explicitly tracking this SKU in stock management
            if (skuMap.has(sku)) {
              const current = skuMap.get(sku)!;
              current.stock -= qty;
            }
          }
        });

        // 3. Finalize calculations
        const result: StockSummary[] = [];
        skuMap.forEach(summary => {
          summary.totalValue = summary.stock * summary.price;
          result.push(summary);
        });

        // Sort alphabetically by SKU
        result.sort((a, b) => a.sku.localeCompare(b.sku));
        setSummaries(result);
      });

      return () => unsubAcc();
    });

    return () => unsubStock();
  }, []);

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku || !newName || !newQty || !newCost) return;
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "stock_entries"), {
        sku_id: newSku.trim(),
        name: newName.trim(),
        stock_qty: parseInt(newQty),
        cost: parseFloat(newCost),
        type: "Inbound",
        source_ref: "Manual",
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
      });

      setIsAddModalOpen(false);
      setNewName("");
      setNewSku("");
      setNewQty("");
      setNewCost("");
    } catch (error) {
      console.error("Error adding stock: ", error);
      alert("Failed to add stock.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editStockQty || !editPrice) return;
    setIsSubmitting(true);

    try {
      const newStock = parseInt(editStockQty);
      const newCost = parseFloat(editPrice);
      const diff = newStock - editingItem.stock;

      await addDoc(collection(db, "stock_entries"), {
        sku_id: editingItem.sku,
        name: editName.trim(),
        stock_qty: diff,
        cost: newCost,
        type: "Inbound",
        source_ref: "Manual Adjustment",
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
      });

      setEditingItem(null);
    } catch (error) {
      console.error("Error updating stock: ", error);
      alert("Failed to update stock.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStock = async (sku: string) => {
    if (!confirm(`Are you sure you want to delete tracking for SKU: ${sku}?`)) return;
    try {
      const q = query(collection(db, "stock_entries"), where("sku_id", "==", sku));
      const snap = await getDocs(q);
      snap.forEach(d => deleteDoc(d.ref));
    } catch (error) {
      console.error("Error deleting stock:", error);
      alert("Failed to delete stock.");
    }
  };

  const filteredSummaries = summaries.filter(s => 
    s.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSkus = summaries.length;
  const totalStockValue = summaries.reduce((sum, item) => sum + (item.stock > 0 ? item.totalValue : 0), 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 font-inter p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary font-poppins">Stock Management</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time inventory tracking (filtered from today)</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-white text-sm font-semibold rounded-xl hover:bg-[#B8962E] transition-colors shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Stock
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 tracking-wider">TOTAL SKUS</p>
            <p className="text-3xl font-extrabold font-poppins text-gray-900 mt-1">{totalSkus}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 tracking-wider">TOTAL STOCK VALUE</p>
            <p className="text-3xl font-extrabold font-poppins text-gray-900 mt-1">₹{totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by SKU or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">SKU ID</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Price per Product</th>
                <th className="px-6 py-4 text-right">Total Value</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSummaries.length > 0 ? (
                filteredSummaries.map((item) => (
                  <tr key={item.sku} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                        {item.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        item.stock > 10 ? 'bg-emerald-100 text-emerald-800' : 
                        item.stock > 0 ? 'bg-amber-100 text-amber-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">₹{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      ₹{item.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setEditingItem(item);
                          setEditName(item.name);
                          setEditStockQty(item.stock.toString());
                          setEditPrice(item.price.toString());
                        }}
                        className="p-1.5 text-gray-400 hover:text-[#D4AF37] transition-colors rounded-lg hover:bg-[#D4AF37]/10 mr-1"
                        title="Edit Stock & Price"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteStock(item.sku)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                        title="Delete SKU Tracking"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="w-10 h-10 text-gray-300 mb-3" />
                      <p className="font-medium text-gray-900">No stock found</p>
                      <p className="text-sm mt-1">Try adjusting your search or add new stock.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-bold text-lg text-gray-900">Add Stock</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleAddStock} className="p-6 flex flex-col gap-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 tracking-wider mb-1.5">PRODUCT NAME</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Premium Leather Wallet" 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)} 
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all shadow-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 tracking-wider mb-1.5">SKU ID</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. WALLET-BLK-01" 
                      value={newSku} 
                      onChange={(e) => setNewSku(e.target.value)} 
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all shadow-sm font-mono" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 tracking-wider mb-1.5">QUANTITY</label>
                      <input 
                        type="number" 
                        required 
                        placeholder="0" 
                        min="1"
                        value={newQty} 
                        onChange={(e) => setNewQty(e.target.value)} 
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all shadow-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 tracking-wider mb-1.5">PRICE (₹)</label>
                      <input 
                        type="number" 
                        required 
                        placeholder="0.00" 
                        min="0"
                        step="0.01"
                        value={newCost} 
                        onChange={(e) => setNewCost(e.target.value)} 
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all shadow-sm" 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-gray-50">
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)} 
                    className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-[#D4AF37] hover:bg-[#B8962E] rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {isSubmitting ? 'Saving...' : 'Add Stock'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Stock Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-bold text-lg text-gray-900">Edit Stock & Price</h2>
                <button onClick={() => setEditingItem(null)} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 flex flex-col gap-5">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 tracking-wider mb-1">TARGET ITEM</p>
                    <p className="text-sm font-mono text-gray-500 mt-1">{editingItem.sku}</p>
                    <div className="mt-3">
                      <label className="block text-xs font-bold text-gray-500 tracking-wider mb-1.5">PRODUCT NAME</label>
                      <input 
                        type="text" 
                        required 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all shadow-sm" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 tracking-wider mb-1.5">NEW TOTAL STOCK</label>
                      <input 
                        type="number" 
                        required 
                        placeholder="0" 
                        value={editStockQty} 
                        onChange={(e) => setEditStockQty(e.target.value)} 
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all shadow-sm" 
                      />
                      <p className="text-xs text-gray-400 mt-1.5">Current: {editingItem.stock}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 tracking-wider mb-1.5">NEW PRICE (₹)</label>
                      <input 
                        type="number" 
                        required 
                        placeholder="0.00" 
                        min="0"
                        step="0.01"
                        value={editPrice} 
                        onChange={(e) => setEditPrice(e.target.value)} 
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all shadow-sm" 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-gray-50">
                  <button 
                    type="button" 
                    onClick={() => setEditingItem(null)} 
                    className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-[#D4AF37] hover:bg-[#B8962E] rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Edit2 className="w-4 h-4" />
                    )}
                    {isSubmitting ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
