"use client";

import { motion } from "framer-motion";

const pillars = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 22H22L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Architectural Precision",
    desc: "Inspired by modern brutalist architecture, our appliances feature strong lines and monolithic forms that command space without cluttering it."
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Emotional Design",
    desc: "Technology should feel human. We focus on tactile feedback—the weight of a dial, the soft close of a door—to create an emotional connection."
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Timeless Materiality",
    desc: "We use only authentic materials: brushed stainless steel, tempered glass, and anodized aluminum. Materials that age gracefully and last a lifetime."
  }
];

export default function DesignPillars() {
  return (
    <section className="py-24 md:py-32 bg-primary">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-20">
          <span className="text-accent font-bold tracking-[0.2em] text-sm uppercase mb-4 block">Core Values</span>
          <h2 className="text-4xl md:text-5xl font-poppins font-bold text-white mb-6">Design Philosophy</h2>
          <p className="text-gray-400 font-inter max-w-2xl mx-auto leading-relaxed">
            We believe that true luxury lies in the subtraction of the unnecessary. Our design philosophy is built on three immutable pillars that guide every product we create.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.2, duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -10 }}
              className="bg-[#1A1A1A] rounded-2xl p-10 flex flex-col items-start group transition-all duration-300 relative overflow-hidden"
            >
              {/* Shimmer Effect */}
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shimmer" />

              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-8 relative">
                {pillar.icon}
                {/* Micro-shimmer on icon hover */}
                <div className="absolute inset-0 rounded-full overflow-hidden block">
                  <div className="absolute top-0 -inset-full h-full w-full z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shimmer" />
                </div>
              </div>

              <h3 className="text-white font-poppins font-bold text-xl mb-4">{pillar.title}</h3>
              <p className="text-gray-400 font-inter text-sm leading-relaxed">{pillar.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
