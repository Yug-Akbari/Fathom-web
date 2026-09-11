"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { APlusBlock } from "@/lib/data";

function CarouselSection({ slides }: { slides: { desktopImage: string; mobileImage: string }[] }) {
  const [index, setIndex] = useState(0);
  if (slides.length === 0) return null;

  return (
    <div className="relative w-full aspect-[3/4] md:aspect-[21/9] rounded-xl overflow-hidden bg-gray-100 shadow-xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img src={slides[index].desktopImage} alt="Carousel" className="absolute inset-0 w-full h-full object-contain hidden md:block" />
          {slides[index].mobileImage && <img src={slides[index].mobileImage} alt="Carousel Mobile" className="absolute inset-0 w-full h-full object-contain block md:hidden" />}
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <button
            onClick={() => setIndex((p) => (p === 0 ? slides.length - 1 : p - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-black/20 hover:bg-black/60 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button
            onClick={() => setIndex((p) => (p === slides.length - 1 ? 0 : p + 1))}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-black/20 hover:bg-black/60 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)} className={`h-2 rounded-full transition-all duration-300 ${index === i ? "bg-accent w-8" : "bg-white/50 hover:bg-white/70 w-2"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function NamedSlideSection({ slides }: { slides: { title: string; desktopImage: string; mobileImage: string }[] }) {
  const [active, setActive] = useState(0);
  if (slides.length === 0) return null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 mb-12 border-b border-white/10 pb-4">
        {slides.map((slide, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`text-xs md:text-sm font-bold tracking-[0.2em] uppercase transition-all duration-300 relative px-2 py-4 ${
              active === i ? "text-accent" : "text-gray-500 hover:text-white"
            }`}
          >
            {slide.title}
            {active === i && (
              <motion.div layoutId="namedSlideUnderline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
            )}
          </button>
        ))}
      </div>
      <div className="relative w-full aspect-[4/5] md:aspect-[21/9] rounded-xl overflow-hidden shadow-2xl bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img src={slides[active].desktopImage} alt={slides[active].title} className="absolute inset-0 w-full h-full object-contain hidden md:block" />
            {slides[active].mobileImage && <img src={slides[active].mobileImage} alt={slides[active].title} className="absolute inset-0 w-full h-full object-contain block md:hidden" />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ProductAPlusContent({ content }: { content?: any }) {
  if (!content) return null;

  let blocks: APlusBlock[] = [];
  if (Array.isArray(content)) {
    blocks = content;
  } else {
    // Backward compatibility migration for old object format
    if (content.standaloneImages) {
      content.standaloneImages.forEach((img: any, i: number) => {
        blocks.push({ id: `migrated_sa_${i}`, type: 'standalone', desktopImage: img.desktopImage, mobileImage: img.mobileImage });
      });
    }
    if (content.namedSlideGroups) {
      content.namedSlideGroups.forEach((g: any, i: number) => {
        blocks.push({ id: `migrated_nsg_${i}`, type: 'named_slide_group', slides: g.slides || [] });
      });
    }
    if (content.carouselGroups) {
      content.carouselGroups.forEach((g: any, i: number) => {
        blocks.push({ id: `migrated_cg_${i}`, type: 'carousel_group', slides: g.slides || [] });
      });
    }
  }

  if (blocks.length === 0) return null;

  return (
    <div className="w-full flex flex-col overflow-hidden">
      {blocks.map((block) => {
        if (block.type === 'standalone') {
          return (
            <div key={block.id} className="w-full">
              {block.desktopImage && (
                <img src={block.desktopImage} alt="Product detail" className="w-full h-auto hidden md:block" />
              )}
              {block.mobileImage && (
                <img src={block.mobileImage} alt="Product detail" className="w-full h-auto block md:hidden" />
              )}
            </div>
          );
        } else if (block.type === 'named_slide_group') {
          if (!block.slides || block.slides.length === 0) return null;
          return (
            <div key={block.id} className="w-full bg-[#111111] py-16 md:py-24">
              <div className="max-w-[1400px] mx-auto px-6">
                <NamedSlideSection slides={block.slides} />
              </div>
            </div>
          );
        } else if (block.type === 'carousel_group') {
          if (!block.slides || block.slides.length === 0) return null;
          return (
            <div key={block.id} className="w-full bg-white py-16 md:py-24">
              <div className="max-w-[1400px] mx-auto px-4 md:px-6">
                <CarouselSection slides={block.slides} />
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
