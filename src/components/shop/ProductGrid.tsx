"use client";

import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { ProductGridSkeleton } from "./ProductSkeleton";
import { Product } from "@/lib/data";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

export default function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return <ProductGridSkeleton count={6} variant="shop" />;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-24 border border-dashed border-neutral-200 rounded-2xl bg-white/50">
        <p className="text-gray-500 font-inter text-base mb-2">No products found matching your selection.</p>
        <span className="text-xs text-gray-400">Try adjusting your filters or search keywords.</span>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={itemVariants}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}
