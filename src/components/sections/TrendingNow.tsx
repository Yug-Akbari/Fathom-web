"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function TrendingNow() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      const featured = data.filter(p => p.isFeatured === true || p.badge === 'Featured');
      setProducts(featured);
    });
    return () => unsub();
  }, []);
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-gray-200 pb-6">
          <div>
            <h2 className="text-3xl font-poppins font-bold text-primary mb-2">Trending Now</h2>
            <p className="text-gray-500">Most coveted appliances of the season.</p>
          </div>
          <button className="flex items-center gap-2 text-accent font-bold tracking-widest text-sm uppercase mt-4 md:mt-0 hover:text-black transition-colors magnet-button">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <Link key={product.id || index} href={`/product/${product.id}`} className="block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true, margin: "-50px" }}
              className="group"
            >
              <div className="relative aspect-[4/5] bg-surface rounded-xl overflow-hidden mb-4 transition-shadow duration-300 group-hover:shadow-2xl group-hover:shadow-black/10">
                {/* Dynamic Badge */}
                {(product.isBestSeller || product.isFeatured || product.badge) && (
                  <div className={`absolute top-4 left-4 z-10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-2 shadow-sm ${
                    product.isBestSeller 
                      ? 'bg-black/90 text-white backdrop-blur-md' 
                      : product.isFeatured 
                        ? 'bg-[#FDF8E4] text-[#D4AF37] border border-[#D4AF37]/20' 
                        : 'bg-primary text-white'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      product.isBestSeller ? 'bg-[#D4AF37]' : product.isFeatured ? 'bg-[#D4AF37]' : 'bg-white'
                    }`}></span>
                    {product.isBestSeller ? 'Bestseller' : product.isFeatured ? 'Featured' : product.badge}
                  </div>
                )}
                
                <div className="absolute inset-0 p-8">
                  <motion.div 
                    className="relative w-full h-full origin-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <Image
                      src={product.image || '/images/fridge-obsidian.png'}
                      alt={product.name}
                      fill
                      className="object-contain drop-shadow-xl"
                    />
                  </motion.div>
                </div>
              </div>

              <div>
                <h3 className="font-poppins font-bold text-primary text-lg">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{product.category || product.desc} Appliance</p>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-accent">₹{product.price}</span>
                  {product.oldPrice && (
                    <span className="text-sm text-gray-400 line-through">₹{product.oldPrice}</span>
                  )}
                </div>
              </div>
            </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
