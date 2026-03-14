"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function InventoryControl() {
  const [activeTab, setActiveTab] = useState("All Products");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setProducts(data);
      setIsLoading(false);
    });

    const unsubCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
      const dbCategories = snapshot.docs.map(doc => doc.data().name);
      setCategories(dbCategories);
    });

    return () => {
      unsub();
      unsubCategories();
    };
  }, []);

  const tabs = ["All Products", ...categories, "Archived"];

  // Perform basic filtering
  const filteredProducts = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
    
    if (activeTab === "Archived") return !p.isActive;
    if (activeTab !== "All Products") return p.category === activeTab;
    
    return p.isActive;
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleFeatured = async (id: string, currentStatus: boolean, isRealDoc: boolean) => {
    // Only update firebase if it's a real firebase doc (mock docs won't have standard firebase IDs)
    if (isRealDoc) {
      const productRef = doc(db, "products", id);
      await updateDoc(productRef, { isFeatured: !currentStatus });
    } else {
      setProducts(products.map(p => p.id === id ? { ...p, isFeatured: !p.isFeatured } : p));
    }
  };

  const handleDelete = async (id: string, isRealDoc: boolean) => {
    if (confirm("Are you sure you want to delete this product?")) {
      if (isRealDoc) {
        await deleteDoc(doc(db, "products", id));
      } else {
        setProducts(products.filter(p => p.id !== id));
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto h-full overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest flex items-center gap-2 mb-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Dashboard
          </span>
          <h1 className="text-3xl font-poppins font-bold text-primary mb-2">Inventory Control</h1>
          <p className="text-gray-500 font-inter text-sm max-w-xl">Manage product listings, stock levels, and featured collections across the global catalog.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search SKU, Name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-accent transition-colors w-64 md:w-80 text-sm"
            />
          </div>
          <Link href="/admin/products/new" className="bg-[#D4AF37] text-white font-bold text-xs uppercase tracking-[0.1em] px-6 py-3.5 rounded-lg hover:bg-[#b5952f] transition-colors flex items-center gap-2 shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Add New Product
          </Link>
        </div>
      </div>

      {/* Top Value Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Total Products", value: products.length, icon: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></> },
          { label: "Low Stock", value: products.filter((p: any) => p.stockCount !== undefined && p.stockCount < 10).length, color: "text-orange-500", icon: <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> },
          { label: "Featured", value: products.filter((p: any) => p.isFeatured).length, color: "text-accent", icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> },
          { label: "Total Value", value: "₹" + products.reduce((sum: number, p: any) => sum + (p.price || 0), 0).toLocaleString('en-IN'), icon: <><rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 12h.01M18 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></> }
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-1">{card.label}</span>
              <span className={`text-2xl lg:text-3xl font-poppins font-bold ${card.color || 'text-primary'}`}>{card.value}</span>
            </div>
            <div className={`w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 ${card.color || 'text-gray-400'}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">{card.icon}</svg>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Interface */}
      <div className="flex-1 flex flex-col bg-white rounded-t-xl border border-gray-100 shadow-sm mt-4 min-h-0">
        
        {/* Table Tabs & Filter */}
        <div className="flex items-center justify-between border-b border-gray-100 px-2 shrink-0 overflow-x-auto custom-scrollbar">
          <div className="flex items-center">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-5 text-xs font-bold tracking-[0.1em] uppercase whitespace-nowrap transition-colors relative ${
                  activeTab === tab ? "text-accent" : "text-gray-500 hover:text-primary"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="inventory-tab" className="absolute bottom-0 left-0 w-full h-[3px] bg-accent" />
                )}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-primary px-6 hover:text-accent transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Filter
          </button>
        </div>

        {/* The Animated Table */}
        <div className="flex-1 overflow-auto bg-[#FDFDFC]">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="sticky top-0 bg-[#FDFDFC] z-10 shadow-[0_1px_0_rgba(243,244,246,1)]">
              <tr>
                <th className="py-4 px-6 w-14">
                  <div 
                    onClick={toggleSelectAll}
                    className={`w-4 h-4 rounded border cursor-pointer border-gray-300 flex items-center justify-center transition-colors ${
                      selectedIds.size > 0 && selectedIds.size === filteredProducts.length ? 'bg-primary border-primary' : 'bg-white'
                    }`}
                  >
                    {selectedIds.size > 0 && selectedIds.size === filteredProducts.length && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-white">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </th>
                <th className="py-4 px-6 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Product Name</th>
                <th className="py-4 px-6 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Category</th>
                <th className="py-4 px-6 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Price</th>
                <th className="py-4 px-6 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Stock Status</th>
                <th className="py-4 px-6 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Featured</th>
                <th className="py-4 px-6 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 w-24">Actions</th>
              </tr>
            </thead>
            
            <motion.tbody layout className="text-sm font-inter relative">
              <AnimatePresence>
                {filteredProducts.map((product) => {
                  const isSelected = selectedIds.has(product.id);
                  return (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      key={product.id} 
                      className={`border-b border-gray-100 transition-colors group ${isSelected ? 'bg-blue-50/30' : 'hover:bg-gray-50/50 hover:shadow-[0_2px_10px_rgba(0,0,0,0.02)]'}`}
                    >
                      <td className="py-2.5 px-6">
                        <div 
                          onClick={() => toggleSelect(product.id)}
                          className={`w-4 h-4 rounded border cursor-pointer flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-primary border-primary' : 'bg-white border-gray-300 group-hover:border-primary'
                          }`}
                        >
                          {isSelected && (
                            <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-white">
                              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                            </motion.svg>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded overflow-hidden shrink-0 relative">
                          <Image 
                            src={product.image || '/images/cream-fridge.png'}
                            alt={product.name} 
                            fill 
                            className="object-cover" 
                          />
                        </div>
                        <div className="flex flex-col max-w-[150px]">
                          <span className="font-semibold text-primary truncate text-sm" title={product.name}>{product.name}</span>
                          <span className="text-xs text-gray-500 font-mono mt-0.5 truncate">SKU: {product.sku}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-6">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">{product.category}</span>
                      </td>
                      <td className="py-2.5 px-6 font-bold text-primary">
                        ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            product.stockStatus === 'In Stock' ? 'bg-green-500' :
                            product.stockStatus === 'Low Stock' ? 'bg-orange-400' : 'bg-red-500'
                          }`}></span>
                          <span className="text-gray-600">
                            {product.stockStatus} <span className="text-gray-400">({product.stockCount})</span>
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-6">
                        <button 
                          onClick={() => toggleFeatured(product.id, product.isFeatured || false, product.createdAt !== undefined)}
                          className={`w-10 h-6 rounded-full transition-colors relative ${product.isFeatured ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <motion.div 
                            layout 
                            className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm"
                            initial={false}
                            animate={{ left: product.isFeatured ? 20 : 4 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                          {product.isFeatured && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="absolute left-1.5 top-1.5 text-white">
                              <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                      </td>
                      <td className="py-2.5 px-6">
                        <div className="flex items-center gap-3 text-gray-400">
                          <button className="hover:text-primary transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="9" y1="21" x2="9" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                          <Link href={`/admin/products/${product.id}`} className="hover:text-primary transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </Link>
                          <button onClick={() => handleDelete(product.id, product.createdAt !== undefined)} className="hover:text-red-500 transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
