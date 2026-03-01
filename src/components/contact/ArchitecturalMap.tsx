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
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.0!2d72.8650!3d21.2250!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04f3c6c0e0001%3A0x0!2s126%2C%20Green%20Plaza%20Shopping%2C%20Mota%20Varachha%2C%20Surat%2C%20Gujarat%20394105!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen={false} 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        ></iframe>
      </motion.div>

      {/* Dropping Gold Pin */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 12, 
          delay: 0.5 
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[100%] z-10 hidden md:flex flex-col items-center"
      >
        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white shadow-xl relative z-10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {/* Pin Shadow */}
        <div className="w-4 h-1 bg-black/30 rounded-full blur-sm mt-1 mx-auto" />
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
