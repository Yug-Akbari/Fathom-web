import { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import TrendingNow from "@/components/sections/TrendingNow";
import CategoryGrid from "@/components/sections/CategoryGrid";
import TrustStrip from "@/components/sections/TrustStrip";

export const metadata: Metadata = {
  title: "FATHOM | Food Dehydrator, Dehydrator & Food Dryer",
  description:
    "FATHOM — Buy the best Food Dehydrator, Dehydrator & Food Dryer online in India: 5 Tray, 8 Tray 1200W, 12 Tray 1500W & 24 Tray 2000W models. Also shop Cold Press Juicers, Smoothie Blenders, Espresso Machines & Coffee Grinders. Free shipping on all orders.",
  keywords: [
    "fathom", "fathom store",
    "food dehydrator", "dehydrator", "food dryer",
    "buy food dehydrator India", "best food dehydrator India", "food dehydrator price India",
    "5 tray food dehydrator", "8 tray food dehydrator 1200w", "12 tray food dehydrator 1500w", "24 tray food dehydrator 2000w",
    "professional food dehydrator india", "food dryer India", "dehydrator India",
    "cold press juicer india", "portable smoothie blender", "espresso machine india", "electric coffee grinder",
    "premium home & kitchen appliances India",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FATHOM | Food Dehydrator, Dehydrator & Food Dryer",
    description:
      "Buy the best Food Dehydrator, Dehydrator & Food Dryer online — 5, 8, 12 & 24 Tray models. Cold Press Juicers, Smoothie Blenders, Espresso Machines & Coffee Grinders too. Free shipping across India.",
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
