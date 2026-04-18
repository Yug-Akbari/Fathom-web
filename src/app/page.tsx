import { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import TrendingNow from "@/components/sections/TrendingNow";
import CategoryGrid from "@/components/sections/CategoryGrid";
import TrustStrip from "@/components/sections/TrustStrip";

export const metadata: Metadata = {
  title: "FATHOM | Food Dehydrator, Dehydrator & Food Dryer",
  description:
    "FATHOM — Buy the best Food Dehydrator, Dehydrator & Food Dryer online in India. Also shop premium Coffee Machines & Coffee Grinders. Free shipping on all orders.",
  keywords: [
    "fathom",
    "fathom store",
    "food dehydrator",
    "dehydrator",
    "food dryer",
    "buy food dehydrator India",
    "best food dehydrator India",
    "food dehydrator price India",
    "food dryer India",
    "dehydrator India",
    "coffee machine India",
    "coffee grinder India",
    "premium home & kitchen appliances India",
  ],
  openGraph: {
    title: "FATHOM | Food Dehydrator, Dehydrator & Food Dryer",
    description:
      "Buy the best Food Dehydrator, Dehydrator & Food Dryer online. Coffee Machines & Grinders too. Free shipping across India.",
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
