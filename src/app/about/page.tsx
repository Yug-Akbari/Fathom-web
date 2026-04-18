import { Metadata } from "next";
import AboutHero from "@/components/about/AboutHero";
import OurMission from "@/components/about/OurMission";
import OurValues from "@/components/about/OurValues";
import OurImpact from "@/components/about/OurImpact";

export const metadata: Metadata = {
  title: "About Us | FATHOM — Our Story & Mission",
  description:
    "Learn about FATHOM — India's trusted brand for Food Dehydrators, Dehydrators, Food Dryers, Coffee Machines & Grinders. 5+ years of excellence, 5000+ happy customers.",
  keywords: [
    "fathom",
    "about fathom",
    "fathom food dehydrator brand",
    "fathom dehydrator",
    "food dryer brand",
    "premium appliances brand",
  ],
  openGraph: {
    title: "About Us | FATHOM — Our Story & Mission",
    description:
      "5+ years of excellence, 5000+ happy customers. Discover FATHOM — India's home for Food Dehydrators & premium appliances.",
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
