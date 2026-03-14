"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";



const parseProductName = (name: string) => {
  const words = name.split(" ");
  if (words.length <= 1) return { title1: words[0] || "", title2: "" };
  const title1 = words.slice(0, Math.ceil(words.length / 2)).join(" ");
  const title2 = words.slice(Math.ceil(words.length / 2)).join(" ");
  return { title1, title2 };
};

const slideVariants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    };
  }
};

export default function Hero() {
  const [[page, direction], setPage] = useState([0, 0]);
  const [activeSlides, setActiveSlides] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      const mainPanelProducts = data.filter(p => p.isMainPanel === true);
      if (mainPanelProducts.length > 0) {
        const mappedSlides = mainPanelProducts.slice(0, 5).map((p, idx) => {
          const { title1, title2 } = parseProductName(p.name);
          return {
            id: p.id || idx,
            title1: title1,
            title2: title2,
            subtitle: p.subtitle || p.category + " Appliance",
            desc: p.desc || "Experience premium quality and performance with this featured product.",
            image: p.image || "/images/dehydrator.png",
            pillTitle: "Category",
            pillValue: p.category || "Premium",
            pillUnit: "★",
          };
        });
        setActiveSlides(mappedSlides);
      }
    });
    return () => unsub();
  }, []);

  const slideIndex = Math.abs(page % activeSlides.length);
  const currentSlide = activeSlides[slideIndex];

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (activeSlides.length > 0) {
        paginate(1);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [page, activeSlides.length]);

  const textVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.5 },
    }),
  };

  if (activeSlides.length === 0) {
    return (
      <section className="relative min-h-[50vh] flex items-center bg-surface overflow-hidden pt-20">
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 flex flex-col justify-center text-center">
            <h1 className="text-2xl text-gray-500 font-poppins">Loading Featured Products...</h1>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[90vh] flex items-center bg-surface overflow-hidden pt-20">
      <div className="max-w-7xl mx-auto px-6 w-full relative z-10 flex flex-col justify-center min-h-[850px] lg:min-h-[700px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0 w-full h-full px-6 flex items-center"
          >
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mx-auto max-w-7xl">
              {/* Text Content */}
              <div className="flex flex-col items-start mt-4 lg:mt-0">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full mb-6 border ${
                    currentSlide.isBestSeller 
                    ? 'bg-black/90 border-black text-[#D4AF37]' 
                    : 'bg-accent/10 border-accent/20 text-accent'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full animate-pulse ${
                    currentSlide.isBestSeller ? 'bg-[#D4AF37]' : 'bg-accent'
                  }`}></span>
                  <span className={`text-xs font-bold uppercase tracking-widest ${
                    currentSlide.isBestSeller ? 'text-[#D4AF37]' : 'text-accent'
                  }`}>
                    {currentSlide.isBestSeller ? 'Bestseller' : currentSlide.isFeatured ? 'Featured' : 'Signature Series'}
                  </span>
                </motion.div>

                <motion.h1 
                  custom={1} initial="hidden" animate="visible" variants={textVariants}
                  className="text-4xl md:text-5xl lg:text-7xl font-poppins font-bold text-primary leading-tight mb-4 uppercase tracking-tighter text-center md:text-left w-full"
                >
                  {currentSlide.title1} <br className="hidden md:block" /> {currentSlide.title2}
                </motion.h1>

                <motion.p 
                  custom={2} initial="hidden" animate="visible" variants={textVariants}
                  className="text-lg md:text-xl lg:text-2xl text-accent italic font-serif mb-4 lg:mb-8 text-center md:text-left w-full"
                >
                  {currentSlide.subtitle}
                </motion.p>

                <motion.p
                  custom={3} initial="hidden" animate="visible" variants={textVariants}
                  className="text-sm md:text-base text-gray-600 max-w-md mb-8 lg:mb-10 leading-relaxed min-h-[100px] lg:min-h-[80px] text-center md:text-left w-full mx-auto md:mx-0"
                >
                  {currentSlide.desc}
                </motion.p>

                <motion.div 
                  custom={4} initial="hidden" animate="visible" variants={textVariants}
                  className="flex flex-wrap items-center justify-center md:justify-start gap-4 lg:gap-6 w-full"
                >
                  <Link href="/shop" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-white px-6 lg:px-8 py-4 font-bold tracking-widest uppercase hover:bg-black transition-colors rounded-none shadow-xl magnet-button">
                    Shop Now
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              </div>

              {/* Image Content */}
              <div className="relative h-[250px] md:h-[400px] lg:h-[600px] w-full mt-8 lg:mt-0 flex items-center justify-center">
                {/* Subtle decoration elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/40 rounded-full blur-3xl -z-10"></div>
                
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  className="relative w-full h-full drop-shadow-2xl"
                >
                  <Image 
                    src={currentSlide.image}
                    alt={currentSlide.title1 + " " + currentSlide.title2}
                    fill
                    className="object-contain"
                    priority
                  />
                </motion.div>
                
                {/* Floating feature pill */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="absolute bottom-4 lg:bottom-10 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-10 bg-white/90 backdrop-blur px-6 py-3 shadow-2xl rounded-2xl flex items-center gap-3 border border-gray-100 min-w-max"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                    <span className="text-xs">{currentSlide.pillUnit}</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{currentSlide.pillTitle}</p>
                    <p className="text-primary font-bold">{currentSlide.pillValue}</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slider Controls */}
      <div className="absolute top-[85%] lg:top-auto lg:bottom-10 left-1/2 lg:left-auto lg:right-10 -translate-x-1/2 lg:translate-x-0 z-20 flex items-center gap-4">
        <button 
          onClick={() => paginate(-1)}
          className="w-12 h-12 rounded-full bg-white/50 backdrop-blur border border-gray-200 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors shadow-lg"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={() => paginate(1)}
          className="w-12 h-12 rounded-full bg-white/50 backdrop-blur border border-gray-200 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors shadow-lg"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Decorative vertical line */}
      <div className="absolute top-0 right-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-gray-300 to-transparent opacity-20 hidden lg:block"></div>
    </section>
  );
}
