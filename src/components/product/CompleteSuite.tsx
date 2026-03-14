"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, limit } from "firebase/firestore";

export default function CompleteSuite() {
  const [suiteProducts, setSuiteProducts] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "products"), limit(3));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        desc: doc.data().description || doc.data().sku || "",
        price: "₹" + (doc.data().price || 0).toLocaleString('en-IN'),
        image: doc.data().image || "/images/fridge-obsidian.png"
      }));
      setSuiteProducts(data);
    });
    return () => unsub();
  }, []);

  if (suiteProducts.length === 0) return null;

  return (
    <section className="py-24 max-w-7xl mx-auto px-6 w-full">
      <div className="flex justify-between items-end mb-12 border-b border-gray-200 pb-4">
        <div>
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-accent mb-4 block">Curation</span>
          <h2 className="text-4xl font-poppins font-bold text-primary">Complete The Suite</h2>
        </div>
        <Link href="/shop" className="text-xs font-bold tracking-[0.2em] uppercase text-primary hover:text-accent transition-colors flex items-center gap-2">
          View All Essentials <span className="text-lg leading-none transform -translate-y-[1px]">&#8599;</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {suiteProducts.map((product, idx) => (
          <Link href={`/product/${product.id}`} key={product.id}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: idx * 0.15 }}
              viewport={{ once: true, margin: "-100px" }}
              className="group cursor-pointer"
            >
              <div className="w-full aspect-square bg-[#f2f2f2] rounded-3xl mb-6 overflow-hidden relative flex items-center justify-center p-8 transition-colors group-hover:bg-[#e8e8e8]">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="relative w-full h-full"
                >
                  <Image 
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain drop-shadow-md scale-90"
                  />
                </motion.div>
              </div>
              
              <h3 className="text-lg font-poppins font-bold text-primary mb-1">{product.name}</h3>
              <p className="font-inter text-slate font-medium">{product.price}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}
