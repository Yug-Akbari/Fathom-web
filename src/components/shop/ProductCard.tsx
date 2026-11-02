"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/CartContext";
import { getOptimizedImageUrl } from "@/lib/imageUtils";

interface Product {
  id: string;
  name: string;
  badge?: string;
  subtitle: string;
  price: number;
  image: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
}

const formatPrice = (price: number) => {
  return "₹" + (price || 0).toLocaleString("en-IN");
};

export default function ProductCard({ product }: { product: Product }) {
  const { items, addItem, setIsCartOpen } = useCart();
  const isInCart = items.some((i) => i.id === product.id);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(getOptimizedImageUrl(product.image));

  useEffect(() => {
    setImgSrc(getOptimizedImageUrl(product.image));
    setImageLoaded(false);
  }, [product.image]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: imgSrc,
    });
    setIsCartOpen(true);
  };

  return (
    <Link href={`/product/${product.id}`} passHref>
      <div className="group cursor-pointer bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:bg-white flex flex-col pt-6 pb-8 px-8 relative h-full border border-neutral-100/80">
        {/* Dynamic Badge */}
        {(product.isBestSeller || product.isFeatured || product.badge) && (
          <div
            className={`absolute top-4 left-4 z-10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-2 shadow-sm ${
              product.isBestSeller
                ? "bg-black/90 text-white backdrop-blur-md"
                : product.isFeatured
                ? "bg-[#FDF8E4] text-[#D4AF37] border border-[#D4AF37]/20"
                : "bg-primary text-white"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                product.isBestSeller
                  ? "bg-[#D4AF37]"
                  : product.isFeatured
                  ? "bg-[#D4AF37]"
                  : "bg-white"
              }`}
            ></span>
            {product.isBestSeller
              ? "Bestseller"
              : product.isFeatured
              ? "Featured"
              : product.badge}
          </div>
        )}

        {/* Image Container with Smooth Fade & Hover Zoom */}
        <div className="relative aspect-square w-full mb-8 overflow-hidden rounded-xl bg-neutral-50/50 flex items-center justify-center">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-neutral-100/70 animate-pulse rounded-xl" />
          )}
          <motion.div
            className="w-full h-full relative"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Image
              src={imgSrc}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImgSrc("/images/fridge-obsidian.png");
                setImageLoaded(true);
              }}
              className={`object-contain drop-shadow-md transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </motion.div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-poppins font-bold text-lg text-primary leading-tight max-w-[70%]">
              {product.name}
            </h3>
            <span className="font-inter font-medium text-accent">
              {formatPrice(product.price)}
            </span>
          </div>

          <div className="mt-auto flex justify-between items-center border-t border-gray-100 pt-4 group-hover:border-accent/20 transition-colors duration-300">
            <span className="text-xs font-bold uppercase tracking-widest text-primary group-hover:text-accent transition-colors">
              View Details
            </span>
            <motion.button
              whileHover={{ rotate: isInCart ? 0 : 90, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              onClick={handleAddToCart}
              className={`w-8 h-8 rounded-full flex justify-center items-center magnet-button shadow-md z-10 ${
                isInCart
                  ? "bg-green-500 text-white"
                  : "bg-primary text-white hover:bg-accent"
              }`}
            >
              {isInCart ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </div>
    </Link>
  );
}
