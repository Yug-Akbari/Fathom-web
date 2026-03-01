"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function ParallaxBanner() {
  return (
    <section className="relative w-full h-[600px] overflow-hidden bg-primary flex items-center justify-center rounded-[32px] my-24 mx-auto max-w-[1400px] px-6">
      <motion.div 
        className="absolute inset-0 w-full h-[150%] -top-[25%]"
        initial={{ y: 0 }}
        whileInView={{ y: "-10%" }}
        transition={{ ease: "linear", duration: 1 }}
        viewport={{ margin: "200px 0px" }}
        // This is a simulated parallax since true scroll-linking is complex in a simple block without useScroll binding
        // But gives a great "depth" effect on scroll-in
      >
        <Image
          src="/images/fridge-obsidian.png" // using existing image as a placeholder for the banner
          alt="Designed for Distinction"
          fill
          className="object-cover opacity-30 mix-blend-overlay grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-primary/80"></div>
      </motion.div>

      <div className="relative z-10 text-center max-w-3xl px-6">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-poppins font-bold text-white mb-6"
        >
          Designed for Distinction
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-lg text-gray-300 font-inter font-light leading-relaxed mb-10"
        >
          The Obsidian Series seamlessly blends into the modern home, elevating everyday living into an art form through quiet sophistication and unparalleled craftsmanship.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="px-8 py-3 border border-white/20 text-white text-sm font-bold tracking-widest uppercase hover:bg-white hover:text-primary transition-all rounded-full backdrop-blur-sm magnet-button"
        >
          Explore The Collection
        </motion.button>
      </div>
    </section>
  );
}
