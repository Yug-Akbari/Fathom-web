import { Metadata } from "next";
import { Suspense } from "react";
import ShopClient from "@/components/shop/ShopClient";

export const metadata: Metadata = {
  title: "Shop Kitchen Appliances | FATHOM",
  description:
    "Browse FATHOM's full collection of ultra-premium home & kitchen appliances. Food Dehydrators, Coffee machine, Coffee grinder & more — engineered for the modern home. Free shipping across India.",
  keywords: [
    "shop kitchen appliances India",
    "premium Food Dehydrators India",
    "luxury Coffee machine India",
    "Coffee grinder India",
    "FATHOM appliances shop",
  ],
  openGraph: {
    title: "Shop Home & Kitchen Appliances | FATHOM",
    description:
      "Browse our full collection of ultra-premium home & kitchen appliances. Free shipping across India.",
    url: "https://www.fathomstore.in/shop",
    siteName: "FATHOM",
    type: "website",
  },
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
