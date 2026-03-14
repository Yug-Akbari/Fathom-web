"use client";

import { motion } from "framer-motion";

export default function InquiryHero() {
  return (
    <div className="pt-32 pb-16 max-w-7xl mx-auto px-6">
      <div className="flex flex-col max-w-2xl">
        <h1 className="flex flex-wrap items-end mb-6">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl md:text-8xl font-black text-primary tracking-tighter"
          >
            INQUIRY
          </motion.span>
        </h1>
        
      </div>
    </div>
  );
}
