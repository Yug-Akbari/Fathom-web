"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface APlusContent {
  namedSlides?: {
    title: string;
    desktopImage: string;
    mobileImage: string;
  }[];
  carouselSlides?: {
    desktopImage: string;
    mobileImage: string;
  }[];
}

export default function ProductAPlusContent({ content }: { content?: APlusContent }) {
  const [activeTab, setActiveTab] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  if (!content) return null;

  const hasNamedSlides = content.namedSlides && content.namedSlides.length > 0;
  const hasCarousel = content.carouselSlides && content.carouselSlides.length > 0;

  if (!hasNamedSlides && !hasCarousel) return null;

  return (
    <div className="w-full flex flex-col bg-background overflow-hidden">
      
      {/* Named Slides Section */}
      {hasNamedSlides && (
        <div className="w-full bg-[#111111] py-16 md:py-24">
          <div className="max-w-[1400px] mx-auto px-6">
            
            {/* Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 mb-12 border-b border-white/10 pb-4">
              {content.namedSlides!.map((slide, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`text-xs md:text-sm font-bold tracking-[0.2em] uppercase transition-all duration-300 relative px-2 py-4 ${
                    activeTab === idx ? "text-accent" : "text-gray-500 hover:text-white"
                  }`}
                >
                  {slide.title}
                  {activeTab === idx && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Images */}
            <div className="relative w-full aspect-[4/5] md:aspect-[21/9] rounded-xl overflow-hidden shadow-2xl bg-black">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  {/* Desktop Image */}
                  <Image
                    src={content.namedSlides![activeTab].desktopImage}
                    alt={content.namedSlides![activeTab].title}
                    fill
                    className="object-cover hidden md:block"
                    priority
                  />
                  {/* Mobile Image */}
                  <Image
                    src={content.namedSlides![activeTab].mobileImage}
                    alt={content.namedSlides![activeTab].title}
                    fill
                    className="object-cover block md:hidden"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            
          </div>
        </div>
      )}

      {/* Carousel Section */}
      {hasCarousel && (
        <div className="w-full bg-white py-16 md:py-24 relative">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 relative">
            <div className="relative w-full aspect-[3/4] md:aspect-[21/9] rounded-xl overflow-hidden bg-gray-100 shadow-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={carouselIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  {/* Desktop Image */}
                  <Image
                    src={content.carouselSlides![carouselIndex].desktopImage}
                    alt="Carousel Slide Desktop"
                    fill
                    className="object-cover hidden md:block"
                    priority
                  />
                  {/* Mobile Image */}
                  <Image
                    src={content.carouselSlides![carouselIndex].mobileImage}
                    alt="Carousel Slide Mobile"
                    fill
                    className="object-cover block md:hidden"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              {content.carouselSlides!.length > 1 && (
                <>
                  <button
                    onClick={() => setCarouselIndex((prev) => (prev === 0 ? content.carouselSlides!.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-black/20 hover:bg-black/60 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors z-10"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button
                    onClick={() => setCarouselIndex((prev) => (prev === content.carouselSlides!.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-black/20 hover:bg-black/60 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors z-10"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </>
              )}
            </div>

            {/* Dots */}
            {content.carouselSlides!.length > 1 && (
              <div className="absolute bottom-6 md:bottom-8 left-0 right-0 flex justify-center gap-3 z-10">
                {content.carouselSlides!.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCarouselIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${carouselIndex === idx ? "bg-accent w-8" : "bg-black/30 hover:bg-black/50 w-2"}`}
                  />
                ))}
              </div>
            )}

          </div>
        </div>
      )}
      
    </div>
  );
}
