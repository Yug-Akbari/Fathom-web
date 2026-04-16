import { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import TrendingNow from "@/components/sections/TrendingNow";
import CategoryGrid from "@/components/sections/CategoryGrid";
import TrustStrip from "@/components/sections/TrustStrip";

export const metadata: Metadata = {
  title: "FATHOM | Ultra-Premium Kitchen Appliances India",
  description:
    "Discover FATHOM — India's destination for ultra-premium kitchen appliances. Shop Food Dehydrator, Coffee Machine, Coffee Grinder & more. Free shipping on all orders. Trusted by 2500+ customers.",
  keywords: [
    "premium Home & kitchen appliances India",
    "ultra premium appliances",
    "luxury Home & kitchen appliances",
    "FATHOM store",
    "buy Home & kitchen appliances online India",
  ],
  openGraph: {
    title: "FATHOM | Ultra-Premium Home & Kitchen Appliances India",
    description:
      "Shop ultra-premium Home & kitchen appliances crafted for the modern home. Free shipping on all orders.",
    url: "https://www.fathomstore.in",
    siteName: "FATHOM",
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <TrendingNow />
      <CategoryGrid />
      <TrustStrip />
    </>
  );
}
