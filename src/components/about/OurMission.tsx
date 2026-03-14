"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function OurMission() {
  return (
    <section className="w-full py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-6"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-primary mb-2">Our Mission</h2>
          
          <p className="text-lg text-primary font-inter leading-relaxed mb-6">
            To deliver high-quality products that enhance our customers' lives while maintaining the highest standards of service and integrity.
          </p>
          
          <ul className="flex flex-col gap-4 text-primary font-inter">
            <li className="flex items-center gap-4">
              <span className="w-2 h-2 rounded-full bg-black shrink-0"></span>
              Customer-centric approach
            </li>
            <li className="flex items-center gap-4">
              <span className="w-2 h-2 rounded-full bg-black shrink-0"></span>
              Uncompromising quality
            </li>
            <li className="flex items-center gap-4">
              <span className="w-2 h-2 rounded-full bg-black shrink-0"></span>
              Ethical business practices
            </li>
          </ul>
        </motion.div>

        {/* Right Image */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-gray-100 flex items-center justify-center p-8"
        >
          <Image 
            src="/images/dehydrator.png" 
            alt="Food Dehydrator" 
            fill
            className="object-contain p-10 drop-shadow-2xl mix-blend-multiply"
          />
          <div className="absolute bottom-6 left-6 z-10 text-primary font-bold tracking-[0.2em] uppercase text-sm bg-white/80 backdrop-blur px-4 py-2 rounded">
            MISSION STATEMENT
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        </motion.div>

      </div>
    </section>
  );
}
