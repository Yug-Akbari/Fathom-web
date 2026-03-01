import { Suspense } from "react";
import ShopClient from "@/components/shop/ShopClient";

export const metadata = {
  title: "Shop | FATHOM Elite",
  description: "Explore our ultra-premium collection of kitchen appliances.",
};

export default function ShopPage() {
  return (
    <div className="bg-background min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-poppins font-bold text-primary mb-4">
            Our Collection
          </h1>
          <p className="text-gray-600 max-w-2xl text-sm md:text-base leading-relaxed font-inter">
            Experience minimalist luxury and exquisite engineering curated for the modern home. 
            Our signature appliances blend aesthetic beauty with professional performance.
          </p>
        </div>

        {/* Client side interactive layout */}
        <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading products...</div>}>
          <ShopClient />
        </Suspense>
        
      </div>
    </div>
  );
}

