"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, limit, orderBy } from "firebase/firestore";

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubLeads = onSnapshot(collection(db, "leads"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      data.sort((a: any, b: any) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime());
      setLeads(data);
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubUsers();
      unsubLeads();
    };
  }, []);

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const featuredCount = products.filter(p => p.isFeatured).length;
  const bestSellerCount = products.filter(p => p.isBestSeller).length;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 max-w-7xl mx-auto"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-primary mb-2">Dashboard Overview</h1>
          <p className="text-gray-500 font-inter text-sm">Welcome back, here&apos;s what&apos;s happening with your brand today.</p>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">Total Products</span>
          <span className="text-4xl font-poppins font-bold text-primary">{products.length}</span>
          <div className="flex gap-4 mt-3 text-xs font-inter text-gray-500">
            <span><span className="font-bold text-accent">{featuredCount}</span> Featured</span>
            <span><span className="font-bold text-green-600">{bestSellerCount}</span> Best Sellers</span>
          </div>
        </motion.div>

        {/* Total Categories */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">Categories</span>
          <span className="text-4xl font-poppins font-bold text-primary">{categories.length}</span>
          <p className="text-xs text-gray-500 mt-3 font-inter">Product categories active</p>
        </motion.div>

        {/* Total Users */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">Registered Users</span>
          <span className="text-4xl font-poppins font-bold text-primary">{users.length}</span>
          <p className="text-xs text-gray-500 mt-3 font-inter">Signed up accounts</p>
        </motion.div>

        {/* Total Leads */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">Inquiry Leads</span>
          <span className="text-4xl font-poppins font-bold text-primary">{leads.length}</span>
          <p className="text-xs text-gray-500 mt-3 font-inter">Total inquiries received</p>
        </motion.div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Users */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="font-poppins font-bold text-lg">Recent Users</h3>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">{users.length} Total</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-4 px-6 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">User</th>
                  <th className="py-4 px-6 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Email</th>
                  <th className="py-4 px-6 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Role</th>
                  <th className="py-4 px-6 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Last Login</th>
                </tr>
              </thead>
              <tbody className="text-sm font-inter">
                {users.slice(0, 8).map((u: any) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {u.photoURL ? (
                          <Image src={u.photoURL} alt={u.name} width={32} height={32} className="rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                            {(u.name || u.email || "?")[0].toUpperCase()}
                          </div>
                        )}
                        <span className="font-semibold text-primary">{u.name || "—"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-500">{u.email}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${u.isAdmin ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-gray-500'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {u.isAdmin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 whitespace-nowrap text-xs">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "—"}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-400">No users yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          
          {/* Recent Products */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-poppins font-bold text-lg">Recent Products</h3>
              <Link href="/admin/inventory" className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent hover:text-black transition-colors">View All</Link>
            </div>
            
            <div className="flex flex-col gap-5 overflow-hidden">
              {products.slice(0, 4).map((product, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + (i * 0.1) }}
                  key={product.id || i} className="flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden relative shrink-0">
                    <Image 
                      src={product.image || '/images/fridge-obsidian.png'} 
                      alt={product.name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                  <div className="flex-1 flex flex-col min-w-0">
                    <span className="font-bold text-sm text-primary truncate">{product.name}</span>
                    <span className="text-xs text-gray-500 truncate">{product.category || 'Uncategorized'}</span>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-bold text-sm text-accent">₹{(product.price || 0).toLocaleString('en-IN')}</span>
                  </div>
                </motion.div>
              ))}
              {products.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">No products yet</p>
              )}
            </div>
          </motion.div>

          {/* Quick Actions Card */}
          <motion.div variants={itemVariants} className="bg-[#FAF9F6] border border-accent/20 p-6 rounded-xl flex flex-col justify-center">
             <h3 className="font-poppins font-bold text-lg mb-4">Quick Actions</h3>
             <div className="grid grid-cols-2 gap-3">
               <Link href="/admin/products/new" className="bg-white border text-primary border-gray-200 py-3 rounded text-[10px] font-bold tracking-widest uppercase hover:border-accent hover:text-accent transition-colors text-center">Add Product</Link>
               <Link href="/admin/categories" className="bg-white border text-primary border-gray-200 py-3 rounded text-[10px] font-bold tracking-widest uppercase hover:border-accent hover:text-accent transition-colors text-center">Categories</Link>
             </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
