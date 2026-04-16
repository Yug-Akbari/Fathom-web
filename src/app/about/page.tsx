import { Metadata } from "next";
import AboutHero from "@/components/about/AboutHero";
import OurMission from "@/components/about/OurMission";
import OurValues from "@/components/about/OurValues";
import OurImpact from "@/components/about/OurImpact";

export const metadata: Metadata = {
  title: "About Us | FATHOM — Our Story & Mission",
  description:
    "Learn about FATHOM — India's trusted partner for ultra-premium Home & kitchen appliances. 5+ years of excellence, 5000+ happy customers, and an unwavering commitment to quality and innovation.",
  keywords: [
    "about FATHOM store",
    "premium appliances brand India",
    "FATHOM Home & kitchen appliances story",
  ],
  openGraph: {
    title: "About Us | FATHOM — Our Story & Mission",
    description:
      "5+ years of excellence, 5000+ happy customers. Discover the FATHOM story.",
    url: "https://www.fathomstore.in/about",
    siteName: "FATHOM",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen pt-20">
      <AboutHero />
      <OurMission />
      <OurValues />
      <OurImpact />
    </div>
  );
}
