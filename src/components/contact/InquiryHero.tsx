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
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-gray-500 font-inter text-lg md:text-xl leading-relaxed"
        >
          Whether you are an architect designing a masterpiece or a homeowner curating your sanctuary, we are here to assist.
        </motion.p>
      </div>
    </div>
  );
}
