import { Metadata } from "next";
import { Suspense } from "react";
import ShopClient from "@/components/shop/ShopClient";

export const metadata: Metadata = {
  title: "Shop Food Dehydrators, Dehydrators & Food Dryers",
  description:
    "Shop FATHOM's full collection — Food Dehydrators, Dehydrators, Food Dryers, Coffee Machines & Coffee Grinders. Ultra-premium quality. Free shipping across India.",
  keywords: [
    "fathom",
    "shop food dehydrator",
    "buy dehydrator online",
    "food dryer online",
    "best dehydrator",
    "food dehydrator shop",
    "coffee machine buy online",
    "coffee grinder",
    "FATHOM shop",
  ],
  openGraph: {
    title: "Shop Food Dehydrators, Dehydrators & Food Dryers | FATHOM",
    description:
      "Browse Food Dehydrators, Dehydrators, Food Dryers & more. Free shipping across India.",
    url: "https://www.fathomstore.in/shop",
    siteName: "FATHOM",
    type: "website",
  },
};

export default function ShopPage() {
  return (
    <div className="bg-background min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-poppins font-bold text-primary mb-4">
            Our Collection
          </h1>
          <p className="text-gray-600 max-w-2xl text-sm md:text-base leading-relaxed font-inter">
            Experience minimalist luxury and exquisite engineering curated for the modern home.
            Our signature appliances blend aesthetic beauty with professional performance.
          </p>
        </div>
        <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading products...</div>}>
          <ShopClient />
        </Suspense>
      </div>
    </div>
  );
}
