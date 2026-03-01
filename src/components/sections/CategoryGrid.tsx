"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, limit } from "firebase/firestore";



export default function CategoryGrid() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "categories"), limit(6));
    const unsub = onSnapshot(q, (snapshot) => {
      const dbCategories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        title: doc.data().name,
        count: `${doc.data().productCount || 0} Products`,
        image: doc.data().image || "/images/dehydrator.png" // using placeholder if no image URL
      }));
      if (dbCategories.length > 0) {
        setCategories(dbCategories);
      }
    });

    return () => unsub();
  }, []);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // 10% Parallax shift: Move image down slightly as user scrolls down
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <section ref={containerRef} className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-6 text-center mb-16">
        <span className="text-accent text-sm font-semibold tracking-widest uppercase mb-2 block">Categories</span>
        <h2 className="text-3xl md:text-5xl font-poppins font-bold text-primary">Shop by Category</h2>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat, index) => (
          <Link key={index} href={`/shop?category=${encodeURIComponent(cat.title)}`} className="block">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="group relative h-[450px] rounded-[14px] overflow-hidden cursor-pointer bg-white"
            >
              <motion.div 
                style={{ y }} 
                className="absolute inset-0 w-full h-[110%] -top-[5%]"
              >
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </motion.div>
              
              {/* Dark overlay that lightens on hover */}
              <div className="absolute inset-0 bg-black/50 transition-colors duration-500 group-hover:bg-black/20" />

              <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end">
                <h3 className="text-2xl font-poppins font-bold text-white mb-1 group-hover:text-accent transition-colors duration-300">
                  {cat.title}
                </h3>
                
                {/* Text that slides up from bottom */}
                <div className="overflow-hidden">
                  <p className="text-gray-300 font-medium translate-y-[150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                    {cat.count}
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}
