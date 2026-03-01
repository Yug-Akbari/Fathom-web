"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function CinematicHero() {
  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.03,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as any,
      },
    }),
  };

  const title = "Defining the Future of Domestic Luxury".split("");

  return (
    <section className="relative h-screen w-full flex-shrink-0 overflow-hidden flex items-center justify-center -mt-20 bg-primary">
      {/* Background Cinematic Image - Scaling from 1.1 to 1.0 */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full z-0 bg-primary"
      >
        <Image
          src="/images/fridge-obsidian.png"
          alt="Luxury Kitchen Interface"
          fill
          className="object-cover brightness-50 opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/40"></div>
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-6 w-full z-10 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="h-[1px] w-12 bg-accent"></div>
          <span className="text-accent text-[10px] font-bold tracking-[0.3em] uppercase">Since 1984</span>
          <div className="h-[1px] w-12 bg-accent"></div>
        </motion.div>

        <h1 className="text-5xl md:text-7xl lg:text-[100px] font-poppins font-bold text-white leading-[1.1] tracking-tighter mb-8 flex flex-wrap justify-center max-w-5xl gap-x-3 md:gap-x-6">
          {"Defining the Future of Domestic Luxury".split(" ").map((word, wordIdx) => (
            <span key={wordIdx} className="flex whitespace-nowrap">
              {word.split("").map((char, charIdx) => {
                const absoluteIdx = wordIdx * 10 + charIdx;
                return (
                  <motion.span
                    custom={absoluteIdx}
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    key={charIdx}
                  >
                    {char}
                  </motion.span>
                );
              })}
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="text-gray-300 font-inter text-lg lg:text-xl max-w-2xl font-light"
        >
          We blend architectural precision with intuitive technology to create kitchen appliances that are not just tools, but centerpieces of modern living.
        </motion.p>
        
        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-white/50"
        >
          <span className="text-[9px] font-bold tracking-widest uppercase">Scroll</span>
          <div className="w-[1px] h-12 bg-white/20 relative overflow-hidden">
            <motion.div 
              animate={{ y: [0, 48] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-4 bg-white"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
