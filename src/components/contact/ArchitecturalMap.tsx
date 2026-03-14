"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function ArchitecturalMap() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="w-full h-[500px] md:h-[600px] relative bg-gray-100 overflow-hidden mt-20">
      
      {/* Map Container - Fades in */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full grayscale opacity-60 mix-blend-multiply"
      >
        <iframe 
          src="https://maps.google.com/maps?q=126,%20Green%20Plaza%20Shopping,%20Mota%20Varachha,%20Surat,%20Gujarat%20394105&t=m&z=15&output=embed&iwloc=near" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen={false} 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        ></iframe>
      </motion.div>

      {/* FATHOM Map Overlay Box for Context */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute bottom-10 left-6 md:left-1/2 md:-translate-x-1/2 bg-white/90 backdrop-blur-md p-6 rounded-lg shadow-2xl border border-gray-100 max-w-xs w-full md:w-auto text-center"
      >
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent mb-2 block">Surat Flagship</span>
        <h4 className="font-poppins font-bold text-primary text-sm mb-1">126, Green Plaza Shopping</h4>
        <p className="text-gray-500 font-inter text-xs">Mota Varachha, Surat, Gujarat 394105</p>
      </motion.div>

    </section>
  );
}
