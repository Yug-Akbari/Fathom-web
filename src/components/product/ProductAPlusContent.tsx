"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { APlusBlock } from "@/lib/data";

/* ─── Arrow Button ─── */
function ArrowButton({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white/80 hover:text-white bg-black/20 hover:bg-black/50 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 z-20 group ${
        direction === "left" ? "left-3 md:left-6" : "right-3 md:right-6"
      }`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        className="md:w-6 md:h-6 transition-transform duration-200 group-hover:scale-110"
      >
        <polyline
          points={direction === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/* ─── Dot Indicators ─── */
function DotIndicators({ count, active, onSelect }: { count: number; active: number; onSelect: (i: number) => void }) {
  if (count <= 1) return null;
  return (
    <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`h-2 rounded-full transition-all duration-400 ${
            active === i
              ? "bg-accent w-8 shadow-[0_0_10px_rgba(255,165,0,0.5)]"
              : "bg-white/40 hover:bg-white/60 w-2"
          }`}
        />
      ))}
    </div>
  );
}

/* ─── Slide animation variants (horizontal sliding) ─── */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

/* ═══════════════════════════════════════════════════════════════════════════
   CAROUSEL SECTION (Arrow Carousel) — Full-width with auto-play
   ═══════════════════════════════════════════════════════════════════════════ */
function CarouselSection({ slides }: { slides: { desktopImage: string; mobileImage: string }[] }) {
  const [[index, direction], setSlide] = useState([0, 0]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const paginate = useCallback(
    (newDirection: number) => {
      setSlide(([prev]) => {
        let next = prev + newDirection;
        if (next < 0) next = slides.length - 1;
        if (next >= slides.length) next = 0;
        return [next, newDirection];
      });
    },
    [slides.length]
  );

  // Auto-play every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    timeoutRef.current = setInterval(() => paginate(1), 5000);
    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, [paginate, slides.length]);

  const handleNav = useCallback(
    (dir: number) => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
      paginate(dir);
      if (slides.length > 1) {
        timeoutRef.current = setInterval(() => paginate(1), 5000);
      }
    },
    [paginate, slides.length]
  );

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden bg-black">
      <div className="relative w-full aspect-[3/4] md:aspect-[21/9]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "tween", duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
              opacity: { duration: 0.35 },
            }}
            className="absolute inset-0"
          >
            <img
              src={slides[index].desktopImage}
              alt="Carousel"
              className="absolute inset-0 w-full h-full object-contain hidden md:block"
            />
            {slides[index].mobileImage && (
              <img
                src={slides[index].mobileImage}
                alt="Carousel Mobile"
                className="absolute inset-0 w-full h-full object-contain block md:hidden"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {slides.length > 1 && (
        <>
          <ArrowButton direction="left" onClick={() => handleNav(-1)} />
          <ArrowButton direction="right" onClick={() => handleNav(1)} />
          <DotIndicators
            count={slides.length}
            active={index}
            onSelect={(i) => {
              const dir = i > index ? 1 : -1;
              if (timeoutRef.current) clearInterval(timeoutRef.current);
              setSlide([i, dir]);
              if (slides.length > 1) {
                timeoutRef.current = setInterval(() => paginate(1), 5000);
              }
            }}
          />
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   NAMED SLIDE SECTION (Tabs at top + Arrows on image + loop)
   ═══════════════════════════════════════════════════════════════════════════ */
function NamedSlideSection({ slides }: { slides: { title: string; desktopImage: string; mobileImage: string }[] }) {
  const [[active, direction], setSlide] = useState([0, 0]);

  const paginate = useCallback(
    (newDirection: number) => {
      setSlide(([prev]) => {
        let next = prev + newDirection;
        if (next < 0) next = slides.length - 1;
        if (next >= slides.length) next = 0;
        return [next, newDirection];
      });
    },
    [slides.length]
  );

  if (slides.length === 0) return null;

  return (
    <div className="w-full">
      {/* Tab Names — constrained to max-width */}
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-10 pb-4 border-b border-white/10">
          {slides.map((slide, i) => (
            <button
              key={i}
              onClick={() => {
                const dir = i > active ? 1 : -1;
                setSlide([i, dir]);
              }}
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
      </div>

      {/* Full-width Image with Arrows */}
      <div className="relative w-full overflow-hidden bg-black mt-6 md:mt-10">
        <div className="relative w-full aspect-[4/5] md:aspect-[21/9]">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={active}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "tween", duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
                opacity: { duration: 0.35 },
              }}
              className="absolute inset-0"
            >
              <img
                src={slides[active].desktopImage}
                alt={slides[active].title}
                className="absolute inset-0 w-full h-full object-contain hidden md:block"
              />
              {slides[active].mobileImage && (
                <img
                  src={slides[active].mobileImage}
                  alt={slides[active].title}
                  className="absolute inset-0 w-full h-full object-contain block md:hidden"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Arrow Navigation */}
        {slides.length > 1 && (
          <>
            <ArrowButton direction="left" onClick={() => paginate(-1)} />
            <ArrowButton direction="right" onClick={() => paginate(1)} />
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
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
            <div key={block.id} className="w-full bg-[#111111] pt-10 md:pt-16 pb-0">
              <NamedSlideSection slides={block.slides} />
            </div>
          );
        } else if (block.type === 'carousel_group') {
          if (!block.slides || block.slides.length === 0) return null;
          return (
            <div key={block.id} className="w-full bg-black">
              <CarouselSection slides={block.slides} />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
