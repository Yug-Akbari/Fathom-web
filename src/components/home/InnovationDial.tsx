"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const features = [
  "Zero-waste manufacturing facilities",
  "Energy Star® rated across all product lines",
  "95% recyclable materials used in production",
  "Ozone-friendly advanced refrigerants"
];

export default function InnovationDial() {
  return (
    <section className="py-24 md:py-40 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* Left: Typography & Staggered List */}
        <div>
          <h2 className="text-4xl md:text-5xl font-poppins font-bold text-primary mb-6">Sustainable Innovation</h2>
          <p className="text-gray-500 font-inter text-lg leading-relaxed mb-10 max-w-lg">
            Our commitment extends beyond aesthetics. We are pioneering energy-efficient technologies that reduce environmental impact without sacrificing performance. From recyclable packaging to longevity-focused engineering, FATHOM is dedicated to a sustainable future.
          </p>
          
          <ul className="space-y-6">
            {features.map((feature, i) => (
              <motion.li 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="flex items-center gap-4 group cursor-default"
              >
                <div className="w-6 h-6 rounded-full bg-surface border border-gray-200 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-primary font-inter font-medium group-hover:text-accent transition-colors duration-300">{feature}</span>
              </motion.li>
            ))}
          </ul>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-12"
          >
            <a href="#" className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-primary border-b border-primary pb-1 group hover:text-accent hover:border-accent transition-colors">
              Read our Sustainability Report
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform group-hover:translate-x-1 transition-transform">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </motion.div>
        </div>

        {/* Right: The Infinite Dial */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full border border-gray-100 shadow-2xl overflow-hidden flex items-center justify-center bg-surface">
            {/* The actual dial image rotating */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
              className="absolute w-[140%] h-[140%] -inset-[20%]"
            >
              <Image 
                src="/images/fridge-obsidian.png" // Using existing image as a proxy for the dial macro shot
                alt="Precision Dial"
                fill
                className="object-cover opacity-80"
                style={{ objectPosition: 'center top' }}
              />
            </motion.div>
            
            {/* Inner aesthetic ring */}
            <div className="absolute inset-8 rounded-full border border-white/30 z-10 pointer-events-none"></div>
            {/* Center dot */}
            <div className="absolute w-2 h-2 rounded-full bg-accent z-10 pointer-events-none shadow-[0_0_10px_rgba(212,175,55,0.8)]"></div>
          </div>
        </div>

      </div>
    </section>
  );
}
