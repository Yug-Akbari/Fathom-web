"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { Product } from "@/lib/data";
import { getOptimizedImageUrl } from "@/lib/imageUtils";

export default function ProductHero({ product }: { product: Product }) {
  const initialImage = getOptimizedImageUrl(product.image);
  const [activeImage, setActiveImage] = useState(initialImage);
  const [isChangingImage, setIsChangingImage] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descRef = useRef<HTMLDivElement>(null);
  const [displayPrice, setDisplayPrice] = useState(product.price || 0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Use uploaded images array, or fallback to the single main image
  const rawImages = product.images && product.images.length > 0
    ? product.images
    : [product.image];
  const images = rawImages.map((img) => getOptimizedImageUrl(img));

  useEffect(() => {
    setActiveImage(getOptimizedImageUrl(product.image));
  }, [product.image]);

  const handleThumbnailClick = (src: string) => {
    if (src === activeImage) return;
    setIsChangingImage(true);
    setTimeout(() => {
      setActiveImage(src);
      setIsChangingImage(false);
    }, 300);
  };

  // Price Roll-Up Animation
  useEffect(() => {
    let start = 0;
    const end = product.price;
    const duration = 1000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayPrice(end);
        clearInterval(timer);
      } else {
        setDisplayPrice(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [product.price]);

  // Detect if description overflows 3 lines
  useEffect(() => {
    if (descRef.current) {
      const el = descRef.current;
      setIsOverflowing(el.scrollHeight > el.clientHeight);
    }
  }, [product.desc]);

  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" },
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } },
  };

  return (
    <section className="pt-24 pb-16 px-6 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col lg:flex-row gap-16 xl:gap-24">
        {/* Left Column: Massive Product Image */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <motion.div
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full aspect-square bg-surface rounded-[32px] overflow-hidden relative flex items-center justify-center p-6 shadow-sm border border-neutral-100"
          >
            {/* Image Transition Wrapper */}
            <motion.div
              animate={{
                filter: isChangingImage ? "blur(10px)" : "blur(0px)",
                opacity: isChangingImage ? 0.7 : 1,
              }}
              transition={{ duration: 0.4 }}
              className="relative w-full h-full"
            >
              <Image
                src={failedImages[activeImage] ? "/images/fridge-obsidian.png" : activeImage}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain drop-shadow-2xl"
                priority
                onError={() => {
                  setFailedImages((prev) => ({ ...prev, [activeImage]: true }));
                }}
              />
            </motion.div>

            <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur border border-gray-100 px-4 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-primary shadow-lg">
              {product.badge || "Flagship Series"}
            </div>
          </motion.div>

          {/* Thumbnails */}
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {images.map((src, idx) => {
              const displaySrc = failedImages[src] ? "/images/fridge-obsidian.png" : src;
              const isSelected = activeImage === src;
              return (
                <button
                  key={idx}
                  onClick={() => handleThumbnailClick(src)}
                  className={`relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all duration-300 ${
                    isSelected
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "border-transparent hover:border-gray-300 bg-surface"
                  }`}
                >
                  <Image
                    src={displaySrc}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="96px"
                    className="object-cover p-2"
                    onError={() => {
                      setFailedImages((prev) => ({ ...prev, [src]: true }));
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Details & Specs */}
        <motion.div
          className="w-full lg:w-1/2 flex flex-col justify-center py-10"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Title */}
          <motion.h1
            variants={pageTransition}
            className="text-3xl md:text-5xl lg:text-5xl font-poppins font-bold text-primary leading-tight tracking-tight mb-6"
          >
            {product.name}
          </motion.h1>

          {/* Price */}
          <motion.div variants={pageTransition} className="flex items-end gap-4 mb-8">
            <span className="text-3xl font-inter font-medium text-slate">
              ₹{(displayPrice || 0).toLocaleString("en-IN")}.00
            </span>
          </motion.div>

          {/* Description with View More / View Less */}
          <motion.div variants={pageTransition} className="mb-10 max-w-xl">
            {(() => {
              const lines = product.desc
                ? product.desc.split("\n").filter((l) => l.trim() !== "")
                : [];
              const visibleLines = descExpanded ? lines : lines.slice(0, 3);
              const hasMore = lines.length > 3;

              return (
                <>
                  <ul className="list-disc pl-5 space-y-2">
                    {visibleLines.map((line, idx) => {
                      const text = line.trim().startsWith("- ")
                        ? line.trim().substring(2)
                        : line.trim();
                      return (
                        <li key={idx} className="font-inter font-semibold text-primary text-sm">
                          {text}
                        </li>
                      );
                    })}
                  </ul>
                  {hasMore && (
                    <button
                      onClick={() => setDescExpanded(!descExpanded)}
                      className="mt-3 text-sm font-semibold text-accent hover:underline focus:outline-none transition-colors"
                    >
                      {descExpanded ? "View Less" : "View More"}
                    </button>
                  )}
                </>
              );
            })()}
          </motion.div>

          {/* CTAs */}
          <motion.div variants={pageTransition} className="flex flex-col sm:flex-row gap-4 mb-16">
            <motion.a
              href={`https://wa.me/918238543000?text=${encodeURIComponent(
                `Hi FATHOM, I'm interested in the ${product.name} (₹${(
                  product.price || 0
                ).toLocaleString("en-IN")}). Please share more details.`
              )}`}
              target="_blank"
              whileHover={{ scale: 1.02 }}
              className="group relative px-8 py-5 bg-gradient-to-b from-accent to-[#b8952b] text-white font-bold tracking-widest uppercase rounded-full shadow-lg overflow-hidden flex items-center justify-center gap-3 w-full sm:w-auto text-xs"
            >
              <motion.div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
              <MessageCircle className="w-5 h-5 group-hover:animate-pulse" />
              WhatsApp Enquiry
            </motion.a>
            <a
              href="tel:+918238543000"
              className="px-8 py-5 border border-gray-200 text-primary font-bold tracking-widest uppercase rounded-full hover:border-primary transition-colors text-xs w-full sm:w-auto text-center"
            >
              Call Showroom
            </a>
          </motion.div>

          {/* Clean Tech Specs Grid */}
          <motion.div variants={pageTransition} className="pt-8 border-t border-gray-200">
            <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-6">
              Technical Details
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              {product.specs && product.specs.length > 0
                ? product.specs.map((spec: any, idx: number) => (
                    <div key={idx}>
                      <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">
                        {spec.key}
                      </p>
                      <p className="font-inter font-semibold text-primary text-sm">{spec.value}</p>
                    </div>
                  ))
                : null}
              <div>
                <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">Category</p>
                <p className="font-inter font-semibold text-primary text-sm capitalize">
                  {product.category}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">
                  Stock Status
                </p>
                <p
                  className={`font-inter font-semibold ${
                    product.inStock ? "text-primary" : "text-accent"
                  } text-sm`}
                >
                  {product.inStock ? "In Stock" : "Limited Edition"}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
