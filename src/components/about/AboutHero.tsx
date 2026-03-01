"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutHero() {
  return (
    <section className="relative w-full h-[60vh] min-h-[500px] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image showing polished stones/gemstones per design */}
      <div className="absolute inset-0 w-full h-full z-0 bg-gray-900 flex items-center justify-center">
        <Image 
          src="/images/fridge-obsidian.png" 
          alt="Quality background" 
          width={800}
          height={800}
          priority
          className="object-contain opacity-40 blur-sm"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-6 mt-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-poppins font-bold text-white tracking-wide uppercase"
        >
          ABOUT US
        </motion.h1>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-2xl md:text-4xl lg:text-5xl font-poppins font-medium text-white"
        >
          Your trusted partner in quality products
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-base md:text-xl text-gray-200 mt-4 max-w-3xl font-inter leading-relaxed"
        >
          We are dedicated to providing exceptional products and services that exceed our customers' expectations.
        </motion.p>
      </div>
    </section>
  );
}
