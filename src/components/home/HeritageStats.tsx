"use client";

import { motion, useScroll, useTransform, useInView, animate } from "framer-motion";
import { useRef, useEffect } from "react";
import Image from "next/image";

function Counter({ from, to, duration = 2, suffix = "" }: { from: number, to: number, duration?: number, suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView && ref.current) {
      const controls = animate(from, to, {
        duration,
        type: "spring",
        bounce: 0.1,
        onUpdate(value) {
          if (ref.current) {
            ref.current.textContent = Math.round(value) + suffix;
          }
        },
      });
      return () => controls.stop();
    }
  }, [inView, from, to, duration, suffix]);

  return <span ref={ref} className="text-4xl md:text-5xl font-poppins font-bold text-primary">{from}{suffix}</span>;
}

export default function HeritageStats() {
  const containerRef = useRef(null);
  
  // Parallax logic
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const yTransform = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={containerRef} className="py-24 md:py-40 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* Left: Imagery with Parallax */}
        <div className="relative h-[600px] w-full rounded-2xl overflow-hidden bg-gray-100">
          <motion.div style={{ y: yTransform }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
            <Image 
              src="/images/espresso.png"
              alt="Heritage Craftsmanship"
              fill
              className="object-cover"
            />
          </motion.div>
          {/* Overlay aesthetic element */}
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/20 backdrop-blur-md rounded-tr-3xl"></div>
        </div>

        {/* Right: Typography & Stats */}
        <div className="flex flex-col">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-accent font-bold tracking-[0.2em] text-sm uppercase mb-6 flex flex-col gap-2"
          >
            <span>Our Story</span>
            <div className="w-12 h-[2px] bg-accent"></div>
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-primary mb-8"
          >
            Heritage of Craftsmanship
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 font-inter text-lg leading-relaxed mb-12"
          >
            Founded on the principle that the kitchen is the heart of the home, FATHOM began as a boutique workshop dedicated to precision engineering. Over four decades, we have evolved into a global symbol of refined living.
            <br/><br/>
            Every curve, dial, and interface is obsessively calibrated. We don't just manufacture appliances; we sculpt experiences. Our Obsidian Series represents the culmination of this journey—where dark, matte aesthetics meet uncompromising performance.
          </motion.p>

          {/* Counters */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-100">
            <div className="flex flex-col gap-2">
              <Counter from={0} to={40} suffix="+" />
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Years of Excellence</span>
            </div>
            <div className="flex flex-col gap-2">
              <Counter from={0} to={120} />
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Design Awards</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
